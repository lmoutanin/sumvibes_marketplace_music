import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que l'achat appartient à l'utilisateur
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        beat: {
          select: {
            id: true,
            title: true,
            mainFileUrl: true,
            previewUrl: true,
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
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    if (purchase.buyerId !== decoded.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (purchase.paymentStatus !== "COMPLETED") {
      return NextResponse.json(
        { error: "Le paiement n'est pas complété" },
        { status: 400 }
      );
    }

    // Incrémenter le compteur de téléchargements
    await prisma.purchase.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    // TODO: Générer une URL signée temporaire pour S3
    // Pour l'instant, retourner l'URL directe
    return NextResponse.json({
      downloadUrl: purchase.beat.mainFileUrl,
      format: purchase.license.type,
      expiresIn: 3600, // 1 heure
    });
  } catch (error) {
    console.error("Error in GET /api/purchases/[id]/download:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
