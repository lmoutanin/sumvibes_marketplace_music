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
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || !["BUYER", "SELLER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Ne pas permettre de modifier son propre rôle
    if (userId === decoded.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 400 }
      );
    }

    // Mettre à jour le rôle
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Si le nouveau rôle est SELLER et qu'il n'a pas de profil vendeur, en créer un
    if (role === "SELLER") {
      // Récupérer le displayName pour l'artistName obligatoire
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true, username: true },
      });
      await prisma.sellerProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          artistName: targetUser?.displayName || targetUser?.username || "Artiste",
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in PUT /api/admin/users/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
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
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { id: userId } = await params;

    // Ne pas permettre de supprimer son propre compte
    if (userId === decoded.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur (les relations seront supprimées en cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
