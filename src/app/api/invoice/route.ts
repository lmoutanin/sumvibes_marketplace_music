import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { userSchema, itemSchema, invoiceSchema } from "./schema/invoiceModel";
import { createInvoiceBuffer } from "@/lib/pdfkit-invoice/createInvoice";
import { ContractData, LicenseType as ContractLicenseType } from "@/lib/pdfkit-invoice/createContract";
import { createMergedPurchaseDocumentBuffer } from "@/lib/pdfkit-invoice/createMergedDocument";
import { sendInvoiceEmail } from "@/lib/resend";
import { generateInvoiceEmailHtml } from "@/lib/email-templates/invoiceTemplate";
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
            console.warn("Impossible de décoder la signature vendeur (email):", sigError);
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
            console.warn("Impossible de charger la signature vendeur pour email:", sigError);
        }
    }
}

export async function POST(req: NextRequest) {
    try { 
        const authHeader = req.headers.get("authorization");

        const token = authHeader?.split(" ")[1];

        if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

        const decoded = verifyToken(token);

        if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

        const body = await req.json();
        const { shipping, items, payment, purchaseIds, includeContracts } = body;

        await userSchema.validateAsync(shipping);

        for (const item of items) {
            await itemSchema.validateAsync(item);
        }

        await invoiceSchema.validateAsync(payment);

        const data = { shipping, items, payment };

        let pdfBuffer = await createInvoiceBuffer(data);
        let attachmentBaseName = payment.invoice_nr;

        if (includeContracts && Array.isArray(purchaseIds) && purchaseIds.length > 0) {
            const relatedPurchases = await prisma.purchase.findMany({
                where: {
                    id: { in: purchaseIds },
                    buyerId: decoded.userId,
                },
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

            const contractDocuments: ContractData[] = [];

            for (let index = 0; index < relatedPurchases.length; index += 1) {
                const purchase = relatedPurchases[index];
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
                        artist: purchase.beat.seller.sellerProfile?.artistName || "Producteur SUMVIBES",
                        duration: purchase.beat.duration || 0,
                    },
                    licenseType: (purchase.license.type as ContractLicenseType) || "BASIC",
                    purchaseDate: purchase.createdAt,
                    contractNumber: `CONT-${payment.invoice_nr}-${String(index + 1).padStart(2, "0")}`,
                    acceptedAt: purchase.contractAcceptedAt || purchase.createdAt,
                    acceptedIp: purchase.contractAcceptedIp || undefined,
                };

                await attachSellerSignature(
                    contractData,
                    purchase.beat.seller.sellerProfile?.signatureData as string | undefined,
                    purchase.beat.seller.sellerProfile?.signatureUrl as string | undefined,
                );

                contractDocuments.push(contractData);
            }

            if (contractDocuments.length > 0) {
                pdfBuffer = await createMergedPurchaseDocumentBuffer(data, contractDocuments);
                attachmentBaseName = `Facture-et-Contrat-${payment.invoice_nr}`;
            }
        }

        const emailHtml = generateInvoiceEmailHtml(data, { includeContract: attachmentBaseName.startsWith("Facture-et-Contrat-") });

        await sendInvoiceEmail(
            shipping.email,
            attachmentBaseName.startsWith("Facture-et-Contrat-")
                ? `Votre document d'achat ${payment.invoice_nr} — SumVibes`
                : `Votre facture ${payment.invoice_nr} — SumVibes`,
            emailHtml,
            pdfBuffer,
            attachmentBaseName
        );

        console.log("Facture créée et email envoyé pour l'utilisateur :", shipping.email);

        return NextResponse.json({
            message: "Facture créée avec succès",
            invoiceId: payment.invoice_nr
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error in POST /api/invoice:", error);
        if (error?.isJoi) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}