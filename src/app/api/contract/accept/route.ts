import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    // Récupérer l'achat
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: { buyerId: true, contractAcceptedAt: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est l'acheteur
    if (purchase.buyerId !== decoded.userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Si déjà accepté, retourner la date d'acceptation
    if (purchase.contractAcceptedAt) {
      return NextResponse.json(
        {
          message: "Contrat déjà accepté",
          acceptedAt: purchase.contractAcceptedAt,
        },
        { status: 200 }
      );
    }

    // Enregistrer l'acceptation avec date/heure et IP
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const acceptedAt = new Date();

    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        contractAcceptedAt: acceptedAt,
        contractAcceptedIp: String(clientIp).split(",")[0].trim(),
      },
    });

    return NextResponse.json(
      {
        message: "Contrat accepté avec succès",
        acceptedAt,
        timestamp: acceptedAt.getTime(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/contract/accept:", error);
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

    // Vérifier l'état d'acceptation
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: { buyerId: true, contractAcceptedAt: true, contractAcceptedIp: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    if (purchase.buyerId !== decoded.userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({
      contractAccepted: !!purchase.contractAcceptedAt,
      acceptedAt: purchase.contractAcceptedAt,
      acceptedIp: purchase.contractAcceptedIp,
    });
  } catch (error: any) {
    console.error("Error in GET /api/contract/accept:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
