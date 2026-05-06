import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
    const status = searchParams.get("status");

    const where: any = { sellerProfile: { userId: decoded.userId } };
    if (status) {
      where.status = status;
    }

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        orderBy: { requestedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/seller/withdrawals:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

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
    const { amount, method, accountDetails } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Montant invalide" },
        { status: 400 }
      );
    }

    if (!method || !["PAYPAL", "BANK_TRANSFER", "STRIPE"].includes(method)) {
      return NextResponse.json(
        { error: "Méthode de retrait invalide" },
        { status: 400 }
      );
    }

    if (!accountDetails || typeof accountDetails !== "object") {
      return NextResponse.json(
        { error: "Détails du compte requis" },
        { status: 400 }
      );
    }

    // Récupérer le profil vendeur
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!sellerProfile) {
      return NextResponse.json(
        { error: "Profil vendeur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier le solde minimum (20€)
    if (amount < 20) {
      return NextResponse.json(
        { error: "Le montant minimum de retrait est de 20€" },
        { status: 400 }
      );
    }

    // Vérifier que le vendeur a suffisamment de revenus
    if (Number(sellerProfile.totalRevenue) < amount) {
      return NextResponse.json(
        { error: "Revenus insuffisants" },
        { status: 400 }
      );
    }

    // Créer la demande de retrait
    const withdrawal = await prisma.withdrawal.create({
      data: {
        sellerProfileId: sellerProfile.id,
        amount,
        method: method as any,
        status: "PENDING" as any,
        notes: accountDetails ? JSON.stringify(accountDetails) : null,
      },
    });

    // TODO: Envoyer une notification à l'admin
    // TODO: Envoyer un email de confirmation au vendeur

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/seller/withdrawals:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
