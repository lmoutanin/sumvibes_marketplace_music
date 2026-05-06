"use client";

/**
 * Résout une URL de fichier (audio, image, etc.) en gérant les clés R2
 * et en ajoutant le token d'authentification pour les fichiers privés si nécessaire.
 */
export function resolveFileUrl(url: string | undefined | null): string {
    if (!url) return "";

    // Déjà une URL complète ou un blob local
    if (
        url.startsWith("http") ||
        url.startsWith("blob:") ||
        url.startsWith("data:") ||
        url.startsWith("/")
    ) {
        return url;
    }

    // Clés R2 publiques (images/covers/..., images/avatars/...)
    if (url.startsWith("images/")) {
        const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/$/, "");
        return base ? `${base}/${url}` : `/${url}`;
    }

    // Clés R2 privées ou structurées (ex: beats/...)
    // On passe par le gateway API /api/file/[...key]
    if (url.includes("/") && !url.startsWith("/")) {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        return `/api/file/${url}${token ? `?token=${token}` : ""}`;
    }

    // Fallback (ex: ancien nom de fichier seul)
    return url;
}

/**
 * Alias spécifique pour les covers si besoin de logique différente (ex: placeholder)
 */
export function resolveCoverUrl(url: string | undefined | null): string {
    if (!url) return "/logo.jpg"; // Placeholder par défaut
    return resolveFileUrl(url);
}
