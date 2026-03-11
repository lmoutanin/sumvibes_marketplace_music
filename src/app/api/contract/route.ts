import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createContractBuffer, ContractData, LicenseType as ContractLicenseType } from "@/lib/pdfkit-invoice/createContract";
import { getPublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

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

    // Récupérer l'achat avec tous les détails nécessaires
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            address: true,
            city: true,
          },
        },
        beat: {
          select: {
            title: true,
            duration: true,
            seller: {
              select: {
                email: true,
                sellerProfile: {
                  select: { artistName: true, signatureUrl: true, signatureData: true },
                },
              },
            },
          },
        },
        license: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est l'acheteur
    if (purchase.buyerId !== decoded.userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Préparer les données du contrat
    const contractData: ContractData = {
      parties: {
        licensorName: purchase.beat.seller.sellerProfile?.artistName || "SUMVIBES",
        licensorEmail: purchase.beat.seller.email,
        licenseeName: `${purchase.buyer.firstName || ""} ${purchase.buyer.lastName || ""}`.trim(),
        licenseeEmail: purchase.buyer.email,
        licenseeAddress: purchase.buyer.address || "Adresse non fournie",
        licenseeCity: purchase.buyer.city || "Ville non fournie",
      },
      work: {
        title: purchase.beat.title,
        artist:
          purchase.beat.seller.sellerProfile?.artistName ||
          "Producteur SUMVIBES",
        duration: purchase.beat.duration || 0,
      },
      licenseType: (purchase.license.type as ContractLicenseType) || "BASIC",
      purchaseDate: purchase.createdAt,
      contractNumber: `CONT-${purchase.invoiceNumber}`,
      acceptedAt: purchase.contractAcceptedAt || purchase.createdAt,
      acceptedIp: purchase.contractAcceptedIp || undefined,
    };

    const signatureData = purchase.beat.seller.sellerProfile?.signatureData as string | undefined;
    if (signatureData?.startsWith("data:image/png;base64,")) {
      try {
        const base64 = signatureData.split(",")[1] || "";
        contractData.sellerSignatureBuffer = Buffer.from(base64, "base64");
      } catch (sigError) {
        console.warn("Impossible de décoder la signature vendeur (DB):", sigError);
      }
    }

    const signatureKey = purchase.beat.seller.sellerProfile?.signatureUrl as string | undefined;
    if (!contractData.sellerSignatureBuffer && signatureKey?.startsWith("images/signatures/")) {
      try {
        const signatureUrl = getPublicUrl(signatureKey);
        const sigRes = await fetch(signatureUrl);
        if (sigRes.ok) {
          const arr = await sigRes.arrayBuffer();
          contractData.sellerSignatureBuffer = Buffer.from(arr);
        }
      } catch (sigError) {
        console.warn("Impossible de charger la signature vendeur:", sigError);
      }
    }

    // Générer le PDF du contrat
    const pdfBuffer = await createContractBuffer(contractData);

    // Retourner le PDF avec les bons headers
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Contrat-Licence-${purchase.license.type}-${purchase.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/contract:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const purchaseId = searchParams.get("purchaseId");

    if (!purchaseId) {
      return NextResponse.json({ error: "purchaseId requis" }, { status: 400 });
    }

    // Vérifier que l'utilisateur a accès à cet achat
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: { buyerId: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    if (purchase.buyerId !== decoded.userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({
      contractAvailable: true,
      message: "Utilisez POST avec purchaseId pour générer le contrat",
    });
  } catch (error: any) {
    console.error("Error in GET /api/contract:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
