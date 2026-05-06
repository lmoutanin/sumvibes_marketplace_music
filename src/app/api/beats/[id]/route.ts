import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// ─── Helper ───────────────────────────────────────────────────────────────────

// POST /api/beats/[id] — Increment play count (no auth required)
export async function POST(request: NextRequest, context: any) {
  try {
    let ctx = context;
    if (typeof ctx?.then === "function") ctx = await ctx;
    let params = ctx?.params;
    if (typeof params?.then === "function") params = await params;
    const id = params?.id as string;
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    // Accept slug or id
    const beat = await prisma.beat.findFirst({ where: { OR: [{ slug: id }, { id }] } });
    if (!beat) return NextResponse.json({ error: "Beat introuvable" }, { status: 404 });

    await prisma.beat.update({
      where: { id: beat.id },
      data: { plays: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/beats/[id] (plays) error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


export async function GET(request: NextRequest, context: any) {
  try {
    let ctx = context;
    if (typeof ctx?.then === "function") ctx = await ctx;
    let params = ctx?.params;
    if (typeof params?.then === "function") params = await params;
    const id = params?.id as string;
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const token = request.headers.get("authorization")?.split(" ")[1];
    const decoded = token ? verifyToken(token) : null;

    // Search by slug first, then by id (product page uses slug as [id])
    const beat = await prisma.beat.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
        status: { not: "DELETED" }, // Allow ARCHIVED for purchased exclusive beats
      },
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
                totalSales: true,
              },
            },
          },
        },
        licenses: { orderBy: { price: "asc" } },
        reviews: {
          include: {
            user: { select: { id: true, displayName: true, username: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: { select: { reviews: true, favorites: true } },
        purchases: {
          where: {
            license: { type: "EXCLUSIVE" },
            paymentStatus: "COMPLETED",
          },
          select: { buyerId: true },
        },
      },
    });

    if (!beat) {
      return NextResponse.json({ error: "Beat introuvable" }, { status: 404 });
    }

    // Restriction d'accès si le beat est vendu en exclusivité
    const exclusivePurchase = beat.purchases?.[0];
    if (exclusivePurchase) {
      const isBuyer = decoded?.userId === exclusivePurchase.buyerId;
      const isSeller = decoded?.userId === beat.sellerId;
      const isAdmin = decoded?.role === "ADMIN";

      if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json(
          { error: "Ce beat a été vendu en exclusivité et n'est plus accessible au public." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ beat });
  } catch (error) {
    console.error("GET /api/beats/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {

    let ctx = context;
    if (typeof ctx?.then === "function") ctx = await ctx;
    let params = ctx?.params;
    if (typeof params?.then === "function") params = await params;
    const id = params?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID manquant ou invalide" }, { status: 400 });
    }

    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const beat = await prisma.beat.findUnique({ where: { id } });
    if (!beat) return NextResponse.json({ error: "Beat introuvable" }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, subscription: { select: { plan: true } } },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    if (beat.sellerId !== decoded.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const plan = user.subscription?.plan || "FREEMIUM";
    const contentType = request.headers.get("content-type") || "";
    let data: any = {};

    if (contentType.includes("multipart/form-data")) {
      const rawData = await request.formData();
      data = Object.fromEntries(rawData.entries());
      data.genre = rawData.getAll("genre");
      data.mood = rawData.getAll("mood");
      data.instruments = rawData.getAll("instruments");

      // ── R2-based file handling ──
      // The client now uploads files directly to R2 via /api/presign and sends
      // back only the R2 keys as strings in the form data:
      //   coverKey, mp3Key, wavKey, trackoutKey

      const coverKey = typeof data.coverKey === "string" && data.coverKey.trim()
        ? data.coverKey.trim()
        : null;
      const mp3Key = typeof data.mp3Key === "string" && data.mp3Key.trim()
        ? data.mp3Key.trim()
        : null;
      const wavKey = typeof data.wavKey === "string" && data.wavKey.trim()
        ? data.wavKey.trim()
        : null;
      const trackoutKey = typeof data.trackoutKey === "string" && data.trackoutKey.trim()
        ? data.trackoutKey.trim()
        : null;

      if (wavKey && (plan === "FREEMIUM" || !user.subscription)) {
        return NextResponse.json({ error: "La formule Freemium n'autorise pas l'upload de WAV." }, { status: 403 });
      }

      const hasWavNow = wavKey || beat.wavFileUrl;
      if (trackoutKey && !hasWavNow) {
        return NextResponse.json({ error: "L'upload d'un Trackout nécessite aussi l'upload du fichier WAV." }, { status: 400 });
      }
      if (trackoutKey && plan !== "PREMIUM_MONTHLY" && plan !== "PREMIUM_YEARLY") {
        return NextResponse.json({ error: "La formule Standard/Freemium n'autorise pas l'upload de Trackouts." }, { status: 403 });
      }

      if (coverKey) data.coverImage = coverKey;
      if (mp3Key) { data.mp3FileUrl = mp3Key; data.previewUrl = mp3Key; }
      if (wavKey) data.wavFileUrl = wavKey;
      if (trackoutKey) data.trackoutFileUrl = trackoutKey;

    } else {
      data = await request.json();
    }

    // Checking final states of files
    const finalWavUrl = data.wavFileUrl ?? beat.wavFileUrl;
    const finalTrackoutUrl = data.trackoutFileUrl ?? beat.trackoutFileUrl;

    const basicPrice = data.basicPrice ? Number(data.basicPrice) : beat.basicPrice;
    const premiumPrice = data.premiumPrice !== undefined && data.premiumPrice !== ""
      ? Number(data.premiumPrice)
      : beat.premiumPrice;
    const exclusivePrice = data.exclusivePrice !== undefined && data.exclusivePrice !== ""
      ? Number(data.exclusivePrice)
      : beat.exclusivePrice;

    // Prices and file mismatch checks: only block if user explicitly sets 0 when WAV present
    if (finalWavUrl && data.premiumPrice !== undefined && Number(data.premiumPrice) <= 0) {
      return NextResponse.json({ error: "Le prix Non-Exclusif (WAV) est obligatoire car le beat contient un fichier WAV." }, { status: 400 });
    }
    if (!finalWavUrl && data.premiumPrice && Number(data.premiumPrice) > 0) {
      return NextResponse.json({ error: "Vous ne pouvez pas définir de prix Non-Exclusif sans fichier WAV." }, { status: 400 });
    }
    if (finalTrackoutUrl && data.exclusivePrice !== undefined && Number(data.exclusivePrice) <= 0) {
      return NextResponse.json({ error: "Le prix Exclusif (Trackout) est obligatoire car le beat contient un fichier Trackout." }, { status: 400 });
    }
    if (!finalTrackoutUrl && data.exclusivePrice && Number(data.exclusivePrice) > 0) {
      return NextResponse.json({ error: "Vous ne pouvez pas définir de prix Exclusif sans fichier Trackout." }, { status: 400 });
    }

    const updateData: any = {
      title: data.title ?? beat.title,
      description: data.description ?? beat.description,
      genre: data.genre && data.genre.length ? data.genre : beat.genre,
      mood: data.mood && data.mood.length ? data.mood : beat.mood,
      instruments: data.instruments && data.instruments.length ? data.instruments : beat.instruments,
      bpm: data.bpm ? Number(data.bpm) : beat.bpm,
      key: data.key ?? beat.key,
      tags: typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : beat.tags,
      status: data.status ?? beat.status,
      seoTitle: data.seoTitle ?? beat.seoTitle,
      seoDescription: data.seoDescription ?? beat.seoDescription,
      basicPrice,
      premiumPrice: finalWavUrl ? premiumPrice : null,
      exclusivePrice: finalTrackoutUrl ? exclusivePrice : null,
      duration: data.duration ? Number(data.duration) : beat.duration,
    };

    // Apply file key updates (already set to R2 keys in the form-data block above)
    if (data.coverImage) updateData.coverImage = data.coverImage;
    if (data.mp3FileUrl) updateData.mp3FileUrl = data.mp3FileUrl;
    if (data.previewUrl) updateData.previewUrl = data.previewUrl;
    if (data.wavFileUrl) updateData.wavFileUrl = data.wavFileUrl;
    if (data.trackoutFileUrl) updateData.trackoutFileUrl = data.trackoutFileUrl;

    // Update prices if needed to prevent bad data
    if (!finalWavUrl) updateData.premiumPrice = null;
    if (!finalTrackoutUrl) updateData.exclusivePrice = null;

    const updated = await prisma.beat.update({
      where: { id },
      data: updateData,
    });

    // Incrémente totalBeats si le beat n'a jamais été publié et qu'il passe à PUBLISHED
    const passeAPublished = updateData.status === "PUBLISHED";
    const nAJamaisEtePublie = !beat.hasBeenPublished;
    if (passeAPublished && nAJamaisEtePublie) {
      await prisma.sellerProfile.update({
        where: { userId: beat.sellerId },
        data: { totalBeats: { increment: 1 } },
      });
      await prisma.beat.update({
        where: { id },
        data: { hasBeenPublished: true },
      });
    }

    return NextResponse.json({ beat: updated });
  } catch (error) {
    console.error("Update beat by id error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const beat = await prisma.beat.findUnique({ where: { id } });
    if (!beat) return NextResponse.json({ error: "Beat introuvable" }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    if (beat.sellerId !== decoded.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.beat.update({ where: { id }, data: { status: "DELETED" } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete beat by id error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}