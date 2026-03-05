import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { generateInvoiceNumber } from "@/lib/auth";
import { LicenseType, PaymentMethod } from "@prisma/client";
import { count } from "console";
import { base, sub } from "framer-motion/client";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await req.json();
    const { data } = body;

    // Validation
    const cartItems = data?.cart?.items;
    if (!data?.paymentMethod || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Champs requis : paymentMethod, cart.items" },
        { status: 400 }
      );
    }

    // Transaction atomique pour créer licences + achats + stats
    const sharedInvoiceNumber = generateInvoiceNumber();
    const invoiceItems: any[] = [];
    let invoiceSubtotal = 0;
    let invoiceTax = 0;
    let invoiceUser: any = null;

    const purchases = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of cartItems) {
        if (!item.beatId) continue;

        // Récupérer le beat depuis la DB (ne pas faire confiance au client)
        const beat = await tx.beat.findUnique({
          where: { id: item.beatId },
        });

        if (!beat) {
          throw new Error(`Beat introuvable : ${item.beatId}`);
        }

        if (beat.status !== "PUBLISHED") {
          throw new Error(`Beat indisponible : ${beat.title}`);
        }

        if (beat.sellerId === decoded.userId) {
          throw new Error("Vous ne pouvez pas acheter votre propre beat");
        }

        // Créer la licence liée à cet achat
        const license = await tx.license.create({
          data: {
            beatId: beat.id,
            type: (item.licenseType as LicenseType) || "BASIC",
            name: beat.title,
            price: item.price,
            description: beat.description,
          },
        });

        // Calculer les montants
        const priceHT = Number(item.price);
        const taxAmount = Number((priceHT * 0.20).toFixed(2));       // TVA 20%
        const amount = Number((priceHT + taxAmount).toFixed(2));     // Total TTC
        const platformFee = Number((priceHT * 0.15).toFixed(2));     // Commission 15% (sur HT)
        const sellerEarnings = Number((priceHT - platformFee).toFixed(2));

        // Créer l'achat
        const purchase = await tx.purchase.create({
          data: {
            buyerId: decoded.userId,
            beatId: beat.id,
            licenseId: license.id,
            amount,
            taxAmount,
            platformFee,
            sellerEarnings,
            paymentMethod: data.paymentMethod as PaymentMethod,
            paymentStatus: "COMPLETED",
            invoiceNumber: sharedInvoiceNumber,
            stripePaymentId: data.stripePaymentIntentId || null,
            paypalTransactionId: data.paypalTransactionId || null,
          },
          include: {
            beat: { select: { id: true, title: true, coverImage: true } },
            license: { select: { id: true, name: true } },
          },
        });

        // Mettre à jour les stats du vendeur
        await tx.sellerProfile.updateMany({
          where: { userId: beat.sellerId },
          data: {
            totalSales: { increment: 1 },
            totalRevenue: { increment: sellerEarnings },
          },
        });

        // Mettre à jour les stats du beat + archiver si licence exclusive
        await tx.beat.update({
          where: { id: beat.id },
          data: {
            sales: { increment: 1 },
            ...(license.type === "EXCLUSIVE" ? { status: "ARCHIVED" as const } : {}),
          },
        });

        // Accumuler les données de facture
        invoiceItems.push({
          item: beat.title,
          description: beat.description || "",
          quantity: 1,
          amount: priceHT,
        });
        invoiceSubtotal += priceHT;
        invoiceTax += taxAmount;

        if (!invoiceUser) {
          invoiceUser = await tx.user.findUnique({ where: { id: decoded.userId } });
        }

        results.push(purchase);
      }

      return results;
    });

    // Envoyer UNE SEULE facture après la transaction
    if (invoiceUser && invoiceItems.length > 0) {
      const shipping = {
        name: (invoiceUser.firstName || "") + " " + (invoiceUser.lastName || ""),
        email: invoiceUser.email,
        address: invoiceUser.address,
        city: invoiceUser.city,
        postalCode: invoiceUser.postalCode,
        country: invoiceUser.country,
      };
      const payment = {
        subtotal: Number(invoiceSubtotal.toFixed(2)),
        tax: Number(invoiceTax.toFixed(2)),
        total: Number((invoiceSubtotal + invoiceTax).toFixed(2)),
        invoice_nr: sharedInvoiceNumber,
      };

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ shipping, items: invoiceItems, payment }),
      });

      console.log("Invoice sent:", sharedInvoiceNumber, invoiceItems.length, "items");
    }

    return NextResponse.json({ purchases }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/purchases:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Récupérer les achats de l'utilisateur
    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { buyerId: decoded.userId },
        include: {
          beat: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              duration: true,
              bpm: true,
              key: true,
              genre: true,
              seller: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  sellerProfile: {
                    select: { artistName: true },
                  },
                },
              },
            },
          },
          license: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.purchase.count({
        where: { buyerId: decoded.userId },
      }),
    ]);

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error("Error in GET /api/purchases:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
