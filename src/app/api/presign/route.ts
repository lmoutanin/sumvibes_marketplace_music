import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { buildR2Key, getPresignedUploadUrl, FileCategory } from "@/lib/r2";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AllowedContentType = {
    [mime: string]: FileCategory;
};

const ALLOWED_TYPES: AllowedContentType = {
    "audio/mpeg": "audio",
    "audio/mp3": "audio",
    "audio/wav": "audio",
    "audio/x-wav": "audio",
    "image/jpeg": "cover",
    "image/jpg": "cover",
    "image/png": "cover",
    "image/webp": "avatar",
    "application/zip": "stems",
    "application/x-zip-compressed": "stems",
};

const MAX_SIZES: Record<FileCategory, number> = {
    audio: 500 * 1024 * 1024, // 500 MB (WAV/MP3)
    stems: 500 * 1024 * 1024, // 500 MB (ZIP trackout)
    cover: 5 * 1024 * 1024,   //   5 MB
    avatar: 5 * 1024 * 1024,  //   5 MB
    signature: 5 * 1024 * 1024, // 5 MB
};

// ─── POST /api/presign ─────────────────────────────────────────────────────────

/**
 * Retourne une presigned PUT URL pour uploader un fichier directement vers R2.
 *
 * Body JSON attendu :
 * {
 *   filename: string,       // nom du fichier original (ex: "beat.mp3")
 *   contentType: string,    // MIME type (ex: "audio/mpeg")
 *   category?: FileCategory // "audio" | "cover" | "avatar" | "stems" (inféré si absent)
 *   fileSize?: number       // taille en octets (pour validation côté serveur)
 * }
 *
 * Réponse :
 * {
 *   uploadUrl: string,  // URL signée R2 (PUT, expire dans 5 min)
 *   key: string         // clé R2 (à enregistrer en DB)
 * }
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Auth
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Token invalide" }, { status: 401 });
        }

        // 2. Parse body
        const body = await req.json();
        const { filename, contentType, fileSize } = body as {
            filename: string;
            contentType: string;
            fileSize?: number;
            category?: FileCategory;
        };

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: "filename et contentType sont requis" },
                { status: 400 },
            );
        }

        // 3. Inférer la catégorie depuis le contentType
        // Si l'utilisateur envoie un avatar (image/webp depuis /auth/avatar), on
        // laisse passer toutes les images comme "avatar" ou "cover" selon le contexte.
        // Le client peut passer category="avatar" explicitement.
        let category: FileCategory = body.category ?? ALLOWED_TYPES[contentType];

        if (!category) {
            return NextResponse.json(
                { error: `Type de fichier non supporté : ${contentType}` },
                { status: 400 },
            );
        }

        // Les images sans category explicite passent en "cover" par défaut
        if (!body.category && (contentType === "image/jpeg" || contentType === "image/jpg" || contentType === "image/png")) {
            category = "cover";
        }

        // 4. Validation taille (optionnelle, le client peut ne pas l'envoyer)
        if (fileSize !== undefined && fileSize > MAX_SIZES[category]) {
            return NextResponse.json(
                {
                    error: `Fichier trop volumineux. Max ${Math.round(MAX_SIZES[category] / 1024 / 1024)} Mo pour ce type.`,
                },
                { status: 400 },
            );
        }

        // 5. Construire la key R2
        const key = buildR2Key(category, decoded.userId, filename);

        // 6. Générer la presigned URL (PUT, 5 min)
        const uploadUrl = await getPresignedUploadUrl(key, contentType, 300);

        return NextResponse.json({ uploadUrl, key });
    } catch (error) {
        console.error("POST /api/presign error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
