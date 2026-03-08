import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { BeatStatus } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

/**
 * ✅ Sauvegarde un objet File sur le disque dans /public/uploads/<subfolder>
 * et retourne le nom du fichier (pas le chemin complet).
 */
async function saveUploadedFile(
  file: File,
  subfolder = "covers",
): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);

  // Crée le dossier récursivement s'il n'existe pas
  await mkdir(uploadDir, { recursive: true });

  // Nom de fichier unique pour éviter les collisions
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Retourne uniquement le nom du fichier (ex: 1234567890-abc123.jpg)
  return filename;
}

// ─── GET /api/beats ───────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

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
      select: { role: true, subscription: { select: { plan: true } } },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Seuls les vendeurs peuvent créer des beats" },
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
    // ✅ On itère avec formData.entries() mais on garde les File tels quels
    const formData = await req.formData();
    const raw: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      if (raw[key] !== undefined) {
        raw[key] = [
          ...(Array.isArray(raw[key]) ? (raw[key] as unknown[]) : [raw[key]]),
          value instanceof File ? value : String(value),
        ];
      } else {
        // ✅ Ne jamais caster un File en String
        raw[key] = value instanceof File ? value : String(value);
      }
    }

    // 3. ✅ Traitement de la cover EN PREMIER
    // Le client (page.tsx) envoie le fichier image sous la clé "cover"
    // L'ancienne route faisait : String(raw.coverImage ?? raw.coverUrl ?? "")
    // ce qui castait le File en "[object File]" → jamais sauvegardé sur le disque
    let coverImagePath: string | null = null;
    const coverFile = raw.cover;

    if (coverFile instanceof File && coverFile.size > 0) {
      if (coverFile.type !== "image/jpeg" && coverFile.type !== "image/png" && coverFile.type !== "image/jpg") {
        return NextResponse.json(
          { error: "La cover doit obligatoirement être au format PNG ou JPG." },
          { status: 400 },
        );
      }
      if (coverFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "La cover ne doit pas dépasser 5 Mo" },
          { status: 400 },
        );
      }
      // ✅ Sauvegarde physique → retourne "1234567890-abc123.jpg"
      const coverName = await saveUploadedFile(coverFile, "covers");
      coverImagePath = `/uploads/covers/${coverName}`;
    }

    // 4. Extraction Fichiers Musicaux
    const mp3File = raw.mp3File;
    let mp3FileUrl: string | null = null;
    if (mp3File instanceof File && mp3File.size > 0) {
      if (!mp3File.name.toLowerCase().endsWith(".mp3") && mp3File.type !== "audio/mpeg" && mp3File.type !== "audio/mp3") {
        return NextResponse.json({ error: "Le fichier principal doit obligatoirement être un MP3 (.mp3)." }, { status: 400 });
      }
      if (mp3File.size > 200 * 1024 * 1024) {
        return NextResponse.json({ error: "L'audio MP3 ne doit pas dépasser 200 Mo." }, { status: 400 });
      }
      const aName = await saveUploadedFile(mp3File, "beats");
      mp3FileUrl = `/uploads/beats/${aName}`;
    }

    const wavFile = raw.wavFile;
    let wavFileUrl: string | null = null;
    if (wavFile instanceof File && wavFile.size > 0) {
      if (plan === "FREEMIUM" || !user.subscription) {
        return NextResponse.json({ error: "La formule Freemium n'autorise pas l'upload de WAV." }, { status: 403 });
      }
      if (!wavFile.name.toLowerCase().endsWith(".wav") && wavFile.type !== "audio/wav" && wavFile.type !== "audio/x-wav") {
        return NextResponse.json({ error: "Le fichier Haute Qualité doit obligatoirement être un WAV (.wav)." }, { status: 400 });
      }
      if (wavFile.size > 500 * 1024 * 1024) {
        return NextResponse.json({ error: "L'audio WAV ne doit pas dépasser 500 Mo." }, { status: 400 });
      }
      const wName = await saveUploadedFile(wavFile, "beats");
      wavFileUrl = `/uploads/beats/${wName}`;
    }

    const trackoutFile = raw.trackoutFile;
    let trackoutFileUrl: string | null = null;
    if (trackoutFile instanceof File && trackoutFile.size > 0) {
      if (!wavFileUrl) {
        return NextResponse.json({ error: "L'upload d'un Trackout nécessite aussi l'upload du fichier WAV." }, { status: 400 });
      }
      if (plan !== "PREMIUM_MONTHLY" && plan !== "PREMIUM_YEARLY") {
        return NextResponse.json({ error: "La formule Standard/Freemium n'autorise pas l'upload de Trackouts." }, { status: 403 });
      }
      const tName = await saveUploadedFile(trackoutFile, "trackouts");
      trackoutFileUrl = `/uploads/trackouts/${tName}`;
    }

    // 4. Extraction des autres champs
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
    if (!coverImagePath) missing.push("cover (Image)");
    if (!mp3FileUrl) missing.push("Fichier MP3 (Obligatoire)");
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

    if (wavFileUrl && premiumPrice === null) {
      return NextResponse.json({ error: "Le prix Non-Exclusif (WAV) est obligatoire car vous avez fourni un fichier WAV." }, { status: 400 });
    }

    if (!wavFileUrl && premiumPrice !== null) {
      return NextResponse.json({ error: "Vous ne pouvez pas définir de prix Non-Exclusif sans uploader de fichier WAV." }, { status: 400 });
    }

    if (trackoutFileUrl && exclusivePrice === null) {
      return NextResponse.json({ error: "Le prix Exclusif (Trackout) est obligatoire car vous avez fourni un fichier Trackout." }, { status: 400 });
    }

    if (!trackoutFileUrl && exclusivePrice !== null) {
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
        previewUrl: mp3FileUrl!,
        mp3FileUrl: mp3FileUrl!,
        wavFileUrl: wavFileUrl,
        trackoutFileUrl,
        coverImage: coverImagePath,
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
