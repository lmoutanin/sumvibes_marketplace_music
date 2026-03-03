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
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: Prisma.BeatWhereInput = {};

    if (!sellerId) {
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
      select: { role: true },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Seuls les vendeurs peuvent créer des beats" },
        { status: 403 },
      );
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
      if (!coverFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "La cover doit être une image (PNG, JPG, WEBP)" },
          { status: 400 },
        );
      }
      if (coverFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "La cover ne doit pas dépasser 5 Mo" },
          { status: 400 },
        );
      }
      // ✅ Sauvegarde physique → retourne "/uploads/covers/1234567890-abc123.jpg"
      coverImagePath = await saveUploadedFile(coverFile, "covers");
    }

    // 4. Extraction des autres champs
    const title = String(raw.title ?? "").trim();
    const previewUrl = String(raw.previewUrl ?? "").trim();
    const mainFileUrl = String(raw.mainFileUrl ?? raw.previewUrl ?? "").trim();
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
    const tags = toArray(raw.tags);

    const seoTitle = String(raw.seoTitle ?? "").trim() || null;
    const seoDescription = String(raw.seoDescription ?? "").trim() || null;
    const seoKeywords = toArray(raw.seoKeywords);

    // 5. Slug unique
    const rawSlug = String(raw.slug ?? "").trim();
    const baseSlug =
      rawSlug ||
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now()}`;

    // 6. Validation
    const missing: string[] = [];
    if (!title) missing.push("title");
    if (!previewUrl) missing.push("previewUrl");
    if (!genres.length) missing.push("genres");
    if (bpm === null) missing.push("bpm");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Champs requis manquants : ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    // 7. ✅ Création en BDD — coverImage reçoit le nom du fichier
    const beat = await prisma.beat.create({
      data: {
        title,
        slug,
        description,
        genre: genres,
        mood: moods,
        instruments,
        tags,
        bpm: bpm!,
        key,
        duration,
        previewUrl,
        mainFileUrl,
        coverImage: coverImagePath, // juste le nom du fichier
        seoTitle,
        seoDescription,
        seoKeywords,
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
