import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPresignedDownloadUrl, getPublicUrl } from "@/lib/r2";

/**
 * GET /api/file/[...key]
 *
 * Gateway d'accès aux fichiers R2 :
 *
 * - beats/* (PRIVÉS) : nécessite une authentification JWT.
 *   Vérifie que l'utilisateur est autorisé (vendeur, acheteur, ou admin)
 *   puis redirige vers une presigned URL R2 valide 10 minutes.
 *
 * - images/* (PUBLICS) : redirige directement vers l'URL publique R2.
 *   Aucune authentification requise.
 *
 * Exemples :
 *   GET /api/file/beats/userId/1234-beat.mp3   → 302 → presigned URL (10 min)
 *   GET /api/file/images/covers/userId/cover.jpg → 302 → URL publique
 */
export async function GET(
    request: NextRequest,
    context: any,
) {
    try {
        let ctx = context;
        if (typeof ctx?.then === "function") ctx = await ctx;
        let params = ctx?.params;
        if (typeof params?.then === "function") params = await params;

        // Recombine the [...key] segments into the full R2 key
        const keySegments: string[] = Array.isArray(params?.key) ? params.key : [];
        if (!keySegments.length) {
            return NextResponse.json({ error: "Clé manquante" }, { status: 400 });
        }
        const key = keySegments.join("/");

        // ── PUBLIC files (images/covers, images/avatars) ──────────────────────────
        if (key.startsWith("images/")) {
            const publicUrl = getPublicUrl(key);
            return NextResponse.redirect(publicUrl, { status: 302 });
        }

        // ── PRIVATE files (beats/) ────────────────────────────────────────────────
        if (!key.startsWith("beats/")) {
            return NextResponse.json({ error: "Chemin de fichier non reconnu" }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const queryToken = searchParams.get("token");

        // Auth check
        const token =
            queryToken ||
            request.headers.get("authorization")?.split(" ")[1] ||
            request.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Token invalide" }, { status: 401 });
        }

        // Verify user has access to this beat file
        const prisma = (await import("@/lib/prisma")).default;

        // Find the beat that contains this key in any of its file fields
        const beat = await prisma.beat.findFirst({
            where: {
                OR: [
                    { mp3FileUrl: key },
                    { wavFileUrl: key },
                    { trackoutFileUrl: key },
                    { previewUrl: key },
                ],
                status: { not: "DELETED" },
            },
            select: {
                id: true,
                sellerId: true,
                mp3FileUrl: true,
                previewUrl: true,
                purchases: {
                    where: { paymentStatus: "COMPLETED" },
                    select: { buyerId: true },
                },
            },
        });

        if (!beat) {
            return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
        }

        const isSeller = decoded.userId === beat.sellerId;
        const isAdmin = decoded.role === "ADMIN";
        const isBuyer = beat.purchases.some((p) => p.buyerId === decoded.userId);

        // The preview/mp3 is accessible to authenticated users (for preview playback)
        // For WAV and trackout, only buyers/sellers/admins can access
        const isPreviewKey = key === beat.mp3FileUrl || key === beat.previewUrl;

        if (!isPreviewKey && !isBuyer && !isSeller && !isAdmin) {
            return NextResponse.json({ error: "Accès non autorisé à ce fichier" }, { status: 403 });
        }

        // Generate presigned download URL (10 min)
        const signedUrl = await getPresignedDownloadUrl(key, 600);

        return NextResponse.redirect(signedUrl, { status: 302 });
    } catch (error) {
        console.error("GET /api/file error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
