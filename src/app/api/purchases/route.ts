import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { generateInvoiceNumber } from "@/lib/auth";

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
    const { beatId, licenseId, paymentMethod, stripePaymentIntentId } = body;

    // Validation
    if (!beatId || !licenseId || !paymentMethod) {
      return NextResponse.json(
        { error: "Champs requis : beatId, licenseId, paymentMethod" },
        { status: 400 }
      );
    }

    // Récupérer le beat et la licence
    const beat = await prisma.beat.findUnique({
      where: { id: beatId },
      include: {
        seller: true,
        licenses: {
          where: { id: licenseId },
        },
      },
    });

    if (!beat) {
      return NextResponse.json({ error: "Beat introuvable" }, { status: 404 });
    }

    if (beat.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Ce beat n'est pas disponible à l'achat" },
        { status: 400 }
      );
    }

    const license = beat.licenses[0];
    if (!license) {
      return NextResponse.json({ error: "Licence introuvable" }, { status: 404 });
    }

    // Vérifier qu'on n'achète pas son propre beat
    if (beat.sellerId === decoded.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas acheter votre propre beat" },
        { status: 400 }
      );
    }

    // Calculer les montants
    const price = license.price;
    const platformFee = price.mul ? price.mul(0.15) : Number(price) * 0.15;
    const sellerEarnings = Number(price) - Number(platformFee);

    // Créer l'achat
    const purchase = await prisma.purchase.create({
      data: {
        buyerId: decoded.userId,
        beatId,
        licenseId,
        amount: price,
        platformFee,
        sellerEarnings,
        paymentMethod,
        paymentStatus: "COMPLETED",
        invoiceNumber: generateInvoiceNumber(),
        stripePaymentId: stripePaymentIntentId || null,
      },
      include: {
        beat: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
        license: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Mettre à jour les stats du vendeur
    await prisma.sellerProfile.update({
      where: { userId: beat.sellerId },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: sellerEarnings },
      },
    });

    // Mettre à jour les stats du beat
    await prisma.beat.update({
      where: { id: beatId },
      data: {
        sales: { increment: 1 },
      },
    });

    // Si licence exclusive (type EXCLUSIVE), archiver le beat
    if (license.type === "EXCLUSIVE") {
      await prisma.beat.update({
        where: { id: beatId },
        data: { status: "ARCHIVED" },
      });
    }

    // TODO: Envoyer email de confirmation
    // TODO: Générer PDF de facture

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/purchases:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
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
