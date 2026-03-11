import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { BeatStatus } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convertit une valeur FormData en tableau de strings propre */
function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

/** Parse un float, retourne null si invalide */
function toFloat(value: unknown): number | null {
  const n = parseFloat(String(value ?? ""));
  return isNaN(n) ? null : n;
}

/** Parse un int, retourne null si invalide */
function toInt(value: unknown): number | null {
  const n = parseInt(String(value ?? ""));
  return isNaN(n) ? null : n;
}

function hasValue(value: unknown): boolean {
  return String(value ?? "").trim().length > 0;
}

// ─── GET /api/beats ───────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const genre = searchParams.get("genre")?.split(",").filter(Boolean);
    const mood = searchParams.get("mood")?.split(",").filter(Boolean);
    const minBpm = searchParams.get("minBpm");
    const maxBpm = searchParams.get("maxBpm");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sellerId = searchParams.get("sellerId");
    const featured = searchParams.get("featured");
    const statusParam = searchParams.get("status");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: Prisma.BeatWhereInput = {};

    if (statusParam && ["PUBLISHED", "DRAFT", "PENDING_REVIEW", "REJECTED"].includes(statusParam)) {
      // Statut explicitement demandé (ex: status=PUBLISHED depuis la page producer)
      where.status = statusParam as BeatStatus;
    } else if (!sellerId) {
      where.status = "PUBLISHED";
    } else if (!includeDeleted) {
      // Si on récupère les beats d'un user, on exclut les supprimés sauf si includeDeleted=true
      where.status = { not: "DELETED" };
    }

    if (genre?.length) where.genre = { hasSome: genre };
    if (mood?.length) where.mood = { hasSome: mood };

    if (minBpm || maxBpm) {
      where.bpm = {};
      if (minBpm) where.bpm.gte = parseInt(minBpm);
      if (maxBpm) where.bpm.lte = parseInt(maxBpm);
    }

    if (minPrice || maxPrice) {
      where.basicPrice = {};
      if (minPrice) where.basicPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basicPrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (sellerId) where.sellerId = sellerId;
    if (featured === "true") where.featured = true;

    const skip = (page - 1) * limit;

    const [beats, total] = await Promise.all([
      prisma.beat.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              sellerProfile: {
                select: {
                  artistName: true,
                  verified: true,
                  averageRating: true,
                },
              },
            },
          },
          licenses: { orderBy: { price: "asc" } },
          _count: { select: { reviews: true, favorites: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      // Pour le total, on veut pouvoir compter tous les beats d'un user (même supprimés) si includeDeleted=true
      prisma.beat.count({
        where: {
          ...where,
          ...(sellerId && includeDeleted ? { status: undefined } : {}),
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      beats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/beats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des beats" },
      { status: 500 },
    );
  }
}

// ─── POST /api/beats ──────────────────────────────────────────────────────────
/**
 * Crée un nouveau beat.
 *
 * Depuis la migration R2, le client uploade d'abord les fichiers directement
 * vers R2 via POST /api/presign, puis envoie les clés R2 (strings) ici :
 *
 * FormData fields :
 *   - mp3Key        (string, obligatoire)   ← clé R2 du fichier MP3
 *   - wavKey        (string, optionnel)      ← clé R2 du WAV
 *   - trackoutKey   (string, optionnel)      ← clé R2 du Trackout ZIP
 *   - coverKey      (string, obligatoire)    ← clé R2 de la cover
 *   + tous les autres champs texte habituels
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        role: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        subscription: { select: { plan: true } },
        sellerProfile: { select: { signatureData: true } },
      },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Seuls les vendeurs peuvent créer des beats" },
        { status: 403 },
      );
    }

    const missingBaseFields: string[] = [];
    const missingContactFields: string[] = [];
    if (!hasValue(user.firstName)) missingBaseFields.push("firstName");
    if (!hasValue(user.lastName)) missingBaseFields.push("lastName");
    if (!hasValue(user.displayName)) missingBaseFields.push("displayName");
    if (!hasValue(user.email)) missingBaseFields.push("email");

    if (!hasValue(user.phone)) missingContactFields.push("phone");
    if (!hasValue(user.address)) missingContactFields.push("address");
    if (!hasValue(user.city)) missingContactFields.push("city");
    if (!hasValue(user.postalCode)) missingContactFields.push("postalCode");

    const hasSignature = hasValue(user.sellerProfile?.signatureData);

    const missingSections: string[] = [];
    if (missingBaseFields.length > 0) missingSections.push("Informations de base");
    if (missingContactFields.length > 0) missingSections.push("Coordonnées");
    if (!hasSignature) missingSections.push("Signature manuscrite");

    if (missingSections.length > 0) {
      return NextResponse.json(
        {
          error:
            "Profil vendeur incomplet. Complétez Informations de base, Coordonnées et Signature manuscrite dans /account/settings avant d'uploader un beat.",
          missingSections,
          missingFields: {
            base: missingBaseFields,
            contact: missingContactFields,
            signature: hasSignature ? [] : ["signatureData"],
          },
          settingsUrl: "/account/settings?tab=profile",
        },
        { status: 403 },
      );
    }

    const plan = user.subscription?.plan || "FREEMIUM";

    // ─── Enforce Beatmaker Subscription Limits ───
    if (plan === "FREEMIUM" || !user.subscription) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const beatCount = await prisma.beat.count({
        where: {
          sellerId: decoded.userId,
          createdAt: { gte: startOfMonth },
        },
      });
      if (beatCount >= 3) {
        return NextResponse.json(
          { error: "Limite atteinte : 3 beats maximum par mois avec la formule Freemium." },
          { status: 403 }
        );
      }
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const raw: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      if (raw[key] !== undefined) {
        raw[key] = [
          ...(Array.isArray(raw[key]) ? (raw[key] as unknown[]) : [raw[key]]),
          String(value),
        ];
      } else {
        raw[key] = String(value);
      }
    }

    // 3. Récupérer les clés R2 (envoyées par le client après upload direct vers R2)
    const coverKey = String(raw.coverKey ?? "").trim() || null;
    const mp3Key = String(raw.mp3Key ?? "").trim() || null;
    const wavKey = String(raw.wavKey ?? "").trim() || null;
    const trackoutKey = String(raw.trackoutKey ?? "").trim() || null;

    // Validation WAV
    if (wavKey && (plan === "FREEMIUM" || !user.subscription)) {
      return NextResponse.json({ error: "La formule Freemium n'autorise pas l'upload de WAV." }, { status: 403 });
    }

    // Validation Trackout
    if (trackoutKey && !wavKey) {
      return NextResponse.json({ error: "L'upload d'un Trackout nécessite aussi l'upload du fichier WAV." }, { status: 400 });
    }
    if (trackoutKey && plan !== "PREMIUM_MONTHLY" && plan !== "PREMIUM_YEARLY") {
      return NextResponse.json({ error: "La formule Standard/Freemium n'autorise pas l'upload de Trackouts." }, { status: 403 });
    }

    // 4. Extraction des autres champs texte
    const title = String(raw.title ?? "").trim();
    const description = String(raw.description ?? "").trim();
    const key = String(raw.key ?? "").trim() || null;
    const bpm = toInt(raw.bpm);
    const duration = toInt(raw.duration) ?? 180;
    const basicPrice = toFloat(raw.basicPrice);
    const premiumPrice = toFloat(raw.premiumPrice);
    const exclusivePrice = toFloat(raw.exclusivePrice);

    const genres = toArray(raw.genres ?? raw.genre);
    const moods = toArray(raw.moods ?? raw.mood);
    const instruments = toArray(raw.instruments);
    if (instruments.length === 0) instruments.push("Instruments"); // Default fallback

    // 5. Slug unique automatique
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now()}`;

    // 6. Validation
    const missing: string[] = [];
    if (!title) missing.push("title");
    if (!description) missing.push("description");
    if (!coverKey) missing.push("cover (Image)");
    if (!mp3Key) missing.push("Fichier MP3 (Obligatoire)");
    if (!bpm || bpm <= 0) missing.push("BPM (nombre positif requis)");
    if (!duration || duration <= 0) missing.push("Durée (nombre positif requis)");
    if (!key) missing.push("Tonalité (Obligatoire)");
    if (!genres || genres.length === 0) missing.push("Genre (au moins 1 requis)");
    if (!moods || moods.length === 0) missing.push("Ambiance (au moins 1 requis)");
    if (!instruments || instruments.length === 0) missing.push("Instrument (au moins 1 requis)");
    if (basicPrice === null) missing.push("Prix Basic (Obligatoire)");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Champs requis manquants ou invalides : ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    if (wavKey && premiumPrice === null) {
      return NextResponse.json({ error: "Le prix Non-Exclusif (WAV) est obligatoire car vous avez fourni un fichier WAV." }, { status: 400 });
    }

    if (!wavKey && premiumPrice !== null) {
      return NextResponse.json({ error: "Vous ne pouvez pas définir de prix Non-Exclusif sans uploader de fichier WAV." }, { status: 400 });
    }

    if (trackoutKey && exclusivePrice === null) {
      return NextResponse.json({ error: "Le prix Exclusif (Trackout) est obligatoire car vous avez fourni un fichier Trackout." }, { status: 400 });
    }

    if (!trackoutKey && exclusivePrice !== null) {
      return NextResponse.json({ error: "Vous ne pouvez pas définir de prix Exclusif sans uploader de fichier Trackout (ZIP/RAR)." }, { status: 400 });
    }

    if (basicPrice !== null && basicPrice < 0) {
      return NextResponse.json({ error: "Le prix Basic doit être positif ou nul." }, { status: 400 });
    }
    if (premiumPrice !== null && premiumPrice < 0) {
      return NextResponse.json({ error: "Le prix Non-Exclusif doit être positif ou nul." }, { status: 400 });
    }
    if (exclusivePrice !== null && exclusivePrice < 0) {
      return NextResponse.json({ error: "Le prix Exclusif doit être positif ou nul." }, { status: 400 });
    }

    if (plan === "FREEMIUM" && premiumPrice) {
      return NextResponse.json(
        { error: "La vente Non-Exclusive (WAV) est réservée aux abonnements Standard et Premium." },
        { status: 403 }
      );
    }

    if (plan !== "PREMIUM_MONTHLY" && plan !== "PREMIUM_YEARLY" && exclusivePrice) {
      return NextResponse.json(
        { error: "La vente exclusive (Trackout) est réservée aux producteurs Premium." },
        { status: 403 }
      );
    }

    // 7. Création en BDD — on stocke la clé R2 directement
    const beat = await prisma.beat.create({
      data: {
        title,
        slug,
        description,
        genre: genres,
        mood: moods,
        instruments,
        tags: [],
        bpm: bpm!,
        key,
        duration,
        previewUrl: mp3Key!,
        mp3FileUrl: mp3Key!,
        wavFileUrl: wavKey,
        trackoutFileUrl: trackoutKey,
        coverImage: coverKey,
        basicPrice,
        premiumPrice,
        exclusivePrice,
        sellerId: decoded.userId,
        status: BeatStatus.PENDING,
        publishedAt: new Date(),
      },
      include: {
        seller: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ beat }, { status: 201 });
  } catch (error) {
    console.error("POST /api/beats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
