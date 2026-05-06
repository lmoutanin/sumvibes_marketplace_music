import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PUT(
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

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { id: beatId } = await params;
    const body = await req.json();
    const { status, reason } = body;

    if (!status || !["PUBLISHED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour le beat
    const beat = await prisma.beat.update({
      where: { id: beatId },
      data: { status },
      include: {
        seller: {
          select: {
            id: true,
            displayName: true,
            email: true,
            sellerProfile: { select: { artistName: true } },
          },
        },
      },
    });

    // TODO: Envoyer une notification au vendeur
    // TODO: Envoyer un email au vendeur avec la raison si rejeté

    return NextResponse.json(beat);
  } catch (error) {
    console.error("Error in PUT /api/admin/beats/[id]/moderate:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
