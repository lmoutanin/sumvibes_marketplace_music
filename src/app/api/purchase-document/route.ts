import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ContractData, LicenseType as ContractLicenseType } from "@/lib/pdfkit-invoice/createContract";
import { createMergedPurchaseDocumentBuffer } from "@/lib/pdfkit-invoice/createMergedDocument";
import { getPublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

async function attachSellerSignature(
  contractData: ContractData,
  signatureData?: string,
  signatureKey?: string,
) {
  if (signatureData?.startsWith("data:image/png;base64,")) {
    try {
      const base64 = signatureData.split(",")[1] || "";
      contractData.sellerSignatureBuffer = Buffer.from(base64, "base64");
      return;
    } catch (sigError) {
      console.warn("Impossible de décoder la signature vendeur:", sigError);
    }
  }

  if (signatureKey?.startsWith("images/signatures/")) {
    try {
      const signatureUrl = getPublicUrl(signatureKey);
      const sigRes = await fetch(signatureUrl);
      if (sigRes.ok) {
        const arr = await sigRes.arrayBuffer();
        contractData.sellerSignatureBuffer = Buffer.from(arr);
      }
    } catch (sigError) {
      console.warn("Impossible de charger la signature vendeur depuis R2:", sigError);
    }
  }
}

/**
 * Génère et retourne un PDF fusionné contenant:
 * - Page 1: Facture  
 * - Page 2+: Contrat de licence
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const body = await req.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: "purchaseId requis" }, { status: 400 });
    }

    // Récupérer un achat de référence pour retrouver toute la facture associée
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: {
        buyerId: true,
        invoiceNumber: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    if (purchase.buyerId !== decoded.userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const invoicePurchases = await prisma.purchase.findMany({
      where: {
        buyerId: decoded.userId,
        invoiceNumber: purchase.invoiceNumber,
      },
      include: {
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            address: true,
            city: true,
            country: true,
          },
        },
        beat: {
          select: {
            title: true,
            duration: true,
            seller: {
              select: {
                email: true,
                displayName: true,
                address: true,
                city: true,
                country: true,
                postalCode: true,
                sellerProfile: {
                  select: { artistName: true, signatureData: true, signatureUrl: true },
                },
              },
            },
          },
        },
        license: {
          select: {
            type: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (invoicePurchases.length === 0) {
      return NextResponse.json({ error: "Aucun achat trouvé pour cette facture" }, { status: 404 });
    }

    const firstPurchase = invoicePurchases[0];
    const subtotal = invoicePurchases.reduce(
      (sum, current) => sum + Number(current.amount) - Number(current.platformFee) - Number(current.taxAmount),
      0,
    );
    const commission = invoicePurchases.reduce((sum, current) => sum + Number(current.platformFee), 0);
    const tax = invoicePurchases.reduce((sum, current) => sum + Number(current.taxAmount), 0);
    const total = invoicePurchases.reduce((sum, current) => sum + Number(current.amount), 0);

    const invoiceData = {
      payment: {
        invoice_nr: purchase.invoiceNumber,
        subtotal: Number(subtotal.toFixed(2)),
        commission: Number(commission.toFixed(2)),
        commissionRate: subtotal > 0 ? Number(((commission / subtotal) * 100).toFixed(2)) : 0,
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        method: firstPurchase.paymentMethod || "STRIPE",
      },
      shipping: {
        name: `${firstPurchase.buyer.firstName || ""} ${firstPurchase.buyer.lastName || ""}`.trim(),
        address: firstPurchase.buyer.address || "Adresse non fournie",
        city: firstPurchase.buyer.city || "Ville non fournie",
        country: firstPurchase.buyer.country || "France",
      },
      items: invoicePurchases.map((currentPurchase) => ({
        item: currentPurchase.beat.title,
        description: currentPurchase.license.type,
        amount: Number(
          (
            Number(currentPurchase.amount) -
            Number(currentPurchase.platformFee) -
            Number(currentPurchase.taxAmount)
          ).toFixed(2),
        ),
        quantity: 1,
      })),
      seller: {
        name: firstPurchase.beat.seller.displayName || "SUMVIBES",
        email: firstPurchase.beat.seller.email || "email non fourni",
        address: firstPurchase.beat.seller.address || "Adresse non fournie",
        city: firstPurchase.beat.seller.city || "Ville non fournie",
        country: firstPurchase.beat.seller.country || "France",
      }
    };

    const contractDocuments: ContractData[] = [];

    for (let index = 0; index < invoicePurchases.length; index += 1) {
      const currentPurchase = invoicePurchases[index];
      const contractData: ContractData = {
        parties: {
          licensorName: currentPurchase.beat.seller.sellerProfile?.artistName || "SUMVIBES",
          licensorEmail: currentPurchase.beat.seller.email,
          licenseeName: `${currentPurchase.buyer.firstName || ""} ${currentPurchase.buyer.lastName || ""}`.trim(),
          licenseeEmail: currentPurchase.buyer.email,
          licenseeAddress: currentPurchase.buyer.address || "Adresse non fournie",
          licenseeCity: currentPurchase.buyer.city || "Ville non fournie",
        },
        work: {
          title: currentPurchase.beat.title,
          artist: currentPurchase.beat.seller.sellerProfile?.artistName || "Producteur SUMVIBES",
          duration: currentPurchase.beat.duration || 0,
        },
        licenseType: (currentPurchase.license.type as ContractLicenseType) || "BASIC",
        purchaseDate: currentPurchase.createdAt,
        contractNumber: `CONT-${purchase.invoiceNumber}-${String(index + 1).padStart(2, "0")}`,
        acceptedAt: currentPurchase.contractAcceptedAt || currentPurchase.createdAt,
        acceptedIp: currentPurchase.contractAcceptedIp || undefined,
      };

      await attachSellerSignature(
        contractData,
        currentPurchase.beat.seller.sellerProfile?.signatureData as string | undefined,
        currentPurchase.beat.seller.sellerProfile?.signatureUrl as string | undefined,
      );

      contractDocuments.push(contractData);
    }

    const mergedBuffer = await createMergedPurchaseDocumentBuffer(invoiceData, contractDocuments);

    // Retourner le PDF fusionné
    return new NextResponse(new Uint8Array(mergedBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Facture-et-Contrat-${purchase.invoiceNumber}.pdf"`,
        "Cache-Control": "no-cache, no-store, max-age=0",
      },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in POST /api/purchase-document:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
