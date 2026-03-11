import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPublicUrl } from "@/lib/r2";

/**
 * POST /api/auth/signature
 *
 * Met à jour la signature électronique visuelle du vendeur.
 * Le client doit d'abord uploader l'image vers R2 via /api/presign (category="signature")
 * puis envoyer ici la clé R2.
 *
 * Body JSON attendu :
 * { key: string } // ex: images/signatures/{userId}/...
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const key = (body as { key?: string }).key || "";
    if (!key || typeof key !== "string" || !key.startsWith("images/signatures/")) {
      return NextResponse.json(
        { error: "Clé R2 de signature invalide. Attendue: images/signatures/..." },
        { status: 400 }
      );
    }

    const prisma = (await import("@/lib/prisma")).default;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.sellerProfile.upsert({
      where: { userId: decoded.userId },
      update: { signatureUrl: key },
      create: {
        userId: decoded.userId,
        artistName: "Artiste",
        genres: [],
        signatureUrl: key,
      },
    });

    return NextResponse.json({
      key,
      url: getPublicUrl(key),
      message: "Signature vendeur mise à jour",
    });
  } catch (error: any) {
    console.error("Error in POST /api/auth/signature:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}
