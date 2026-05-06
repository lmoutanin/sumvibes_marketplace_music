"use client";

/**
 * Composant Avatar partagé — utiliser partout dans l'application.
 * Affiche la photo de profil si disponible, sinon 2 initiales sur fond dégradé.
 *
 * Résolution des URLs :
 * - Si src commence par "images/avatars/" → URL publique R2 via NEXT_PUBLIC_R2_PUBLIC_URL
 * - Si src commence par "http" ou "/" → utilisé tel quel (rétrocompatibilité)
 * - Sinon → /uploads/avatars/{src} (anciens avatars locaux, rétrocompatibilité)
 */

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";

function resolveAvatarSrc(src: string): string {
  // Nouvelle clé R2
  if (src.startsWith("images/avatars/")) {
    return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${src}` : `/${src}`;
  }
  // URL absolue ou chemin local déjà formé
  if (src.startsWith("http") || src.startsWith("/")) return src;
  // Ancien avatar local (rétrocompatibilité)
  return `/uploads/avatars/${src}`;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function Avatar({ src, name, size = 40, className = "", ring = false }: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.round(size * 0.36));
  const ringClass = ring ? "ring-2 ring-brand-gold/30" : "";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveAvatarSrc(src)}
        alt={name || "avatar"}
        className={`rounded-full object-cover flex-shrink-0 ${ringClass} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex-shrink-0 bg-gradient-to-br from-brand-gold/70 to-brand-purple/60 flex items-center justify-center font-bold text-white select-none ${ringClass} ${className}`}
      style={{ width: size, height: size, fontSize }}
      aria-label={name || "avatar"}
    >
      {initials}
    </div>
  );
}
