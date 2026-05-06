import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPublicUrl } from "@/lib/r2";

/**
 * POST /api/auth/avatar
 *
 * Depuis la migration R2, le client uploade l'avatar directement vers R2
 * via POST /api/presign (category="avatar"), puis envoie ici uniquement la clé R2.
 *
 * Body JSON attendu :
 * { key: string }   ← clé R2 de l'avatar (ex: "images/avatars/{userId}/...")
 *
 * Réponse :
 * { url: string }   ← URL publique de l'avatar
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

    const contentType = req.headers.get("content-type") || "";
    console.log(`[AVATAR_API] Content-Type: ${contentType}, User: ${decoded.userId}`);

    let key = "";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(err => {
        console.error("[AVATAR_API] Failed to parse JSON body:", err);
        return null;
      });
      if (!body) return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
      key = (body as { key?: string }).key || "";
    }
    else if (contentType.includes("multipart/form-data")) {
      console.warn("[AVATAR_API] Received Multipart data (legacy). Attempting to extract key or file...");
      const formData = await req.formData();
      // If they sent a key directly in FormData
      key = formData.get("key") as string || "";
      // If they sent a file (old flow), we tell them it's deprecated
      if (formData.has("file") && !key) {
        return NextResponse.json({
          error: "Format obsolète. Vous devez d'abord uploader l'image vers R2 via /api/presign puis envoyer la clé ici."
        }, { status: 410 });
      }
    } else {
      return NextResponse.json({ error: "Content-Type non supporté. Attendu: application/json" }, { status: 415 });
    }

    if (!key || typeof key !== "string" || !key.startsWith("images/avatars/")) {
      console.error("[AVATAR_API] Invalide R2 Key received:", key);
      return NextResponse.json(
        { error: "Clé R2 d'avatar invalide. Attendue: images/avatars/..." },
        { status: 400 },
      );
    }

    // Construire l'URL publique de l'avatar (pour retour immédiat)
    const avatarUrl = getPublicUrl(key);

    // Mettre à jour le profil utilisateur
    const prisma = (await import("@/lib/prisma")).default;
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { avatar: key },
    });

    console.log(`[AVATAR_API] Success: updated avatar for ${decoded.userId} with key ${key}`);
    return NextResponse.json({ url: avatarUrl });
  } catch (error: any) {
    console.error("Error in POST /api/auth/avatar:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}
