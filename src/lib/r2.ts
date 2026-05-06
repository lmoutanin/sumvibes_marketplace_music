import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── R2 Client ─────────────────────────────────────────────────────────────────

const R2_ENDPOINT = `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const r2Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim()!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim()!,
    },
    // Cloudflare R2 fonctionne mieux avec Path Style pour éviter les erreurs de DNS/SSL sur les domaines virtuels
    forcePathStyle: true,
});

const BUCKET = process.env.R2_BUCKET_NAME?.trim()!;

// ─── Key Builders ──────────────────────────────────────────────────────────────

export type FileCategory = "audio" | "cover" | "avatar" | "signature" | "stems";

/**
 * Génère la key R2 selon la catégorie.
 * - beats/[userId]/[timestamp]-[filename]
 * - images/covers/[userId]/[timestamp]-[filename]
 * - images/avatars/[userId]/[timestamp]-[filename]
 * - images/signatures/[userId]/[timestamp]-[filename]
 */
export function buildR2Key(
    category: FileCategory,
    userId: string,
    filename: string,
): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();

    switch (category) {
        case "audio":
        case "stems":
            return `beats/${userId}/${timestamp}-${sanitized}`;
        case "cover":
            return `images/covers/${userId}/${timestamp}-${sanitized}`;
        case "avatar":
            return `images/avatars/${userId}/${timestamp}-${sanitized}`;
        case "signature":
            return `images/signatures/${userId}/${timestamp}-${sanitized}`;
    }
}

// ─── Presigned Upload URL (PUT) ────────────────────────────────────────────────

/**
 * Génère une presigned URL pour uploader un fichier directement depuis le client.
 * @param key       R2 object key (ex: "beats/userId/123-file.mp3")
 * @param contentType  MIME type du fichier
 * @param expiresIn Durée en secondes (défaut : 300 = 5 min)
 */
export async function getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(r2Client, command, { expiresIn });
}

// ─── Presigned Download URL (GET) ─────────────────────────────────────────────

/**
 * Génère une presigned URL pour accéder à un fichier privé (beat).
 * @param key      R2 object key
 * @param expiresIn Durée en secondes (défaut : 600 = 10 min)
 * @param filename  Nom de fichier suggéré pour le téléchargement
 */
export async function getPresignedDownloadUrl(
    key: string,
    expiresIn = 600,
    filename?: string,
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : undefined,
    });
    return getSignedUrl(r2Client, command, { expiresIn });
}

// ─── Public URL (covers & avatars) ────────────────────────────────────────────

/**
 * Retourne l'URL publique d'un fichier R2 (covers/avatars uniquement).
 * Nécessite que le bucket ait un domaine public activé via NEXT_PUBLIC_R2_PUBLIC_URL.
 */
export function getPublicUrl(key: string): string {
    const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
    if (!base) {
        console.warn("[R2] NEXT_PUBLIC_R2_PUBLIC_URL is not set");
        return `/${key}`;
    }
    return `${base}/${key}`;
}

/**
 * Récupère un flux (stream) pour un fichier R2.
 * Utile pour le bundling ZIP côté serveur.
 */
export async function getFileStream(key: string) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });
    const response = await r2Client.send(command);
    return response.Body; // This is a Readable stream in Node.js
}
