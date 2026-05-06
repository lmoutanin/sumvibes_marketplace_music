import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { hash, compare } from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Veuillez fournir l'ancien et le nouveau mot de passe" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    const prisma = (await import("@/lib/prisma")).default;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const isPasswordValid = await compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "L'ancien mot de passe est incorrect" }, { status: 400 });
    }

    const newPasswordHash = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash: newPasswordHash }
    });

    return NextResponse.json({ success: true, message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
