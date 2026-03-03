import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const beatId = searchParams.get("beatId");

    if (!beatId) {
      return NextResponse.json(
        { error: "ID du beat requis" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { beatId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
            sellerProfile: { select: { artistName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error in GET /api/reviews:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await req.json();
    const { beatId, rating, comment } = body;

    // Validation
    if (!beatId) {
      return NextResponse.json(
        { error: "ID du beat requis" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    // Vérifier que le beat existe
    const beat = await prisma.beat.findUnique({
      where: { id: beatId },
    });

    if (!beat) {
      return NextResponse.json({ error: "Beat non trouvé" }, { status: 404 });
    }

    // Vérifier que l'utilisateur a acheté le beat
    const purchase = await prisma.purchase.findFirst({
      where: {
        beatId,
        buyerId: decoded.userId,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Vous devez acheter le beat pour laisser un avis" },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur n'a pas déjà laissé un avis
    const existingReview = await prisma.review.findFirst({
      where: {
        beatId,
        userId: decoded.userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Vous avez déjà laissé un avis pour ce beat" },
        { status: 400 }
      );
    }

    // Créer le review
    const review = await prisma.review.create({
      data: {
        beatId,
        userId: decoded.userId,
        rating,
        comment: comment?.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
            sellerProfile: { select: { artistName: true } },
          },
        },
      },
    });

    // Mettre à jour la note moyenne du beat
    const allReviews = await prisma.review.findMany({
      where: { beatId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length;

    await prisma.beat.update({
      where: { id: beatId },
      data: { averageRating: avgRating },
    });

    // Mettre à jour la note moyenne du vendeur
    const sellerBeats = await prisma.beat.findMany({
      where: { sellerId: beat.sellerId },
      select: { averageRating: true },
    });

    const sellerAvgRating =
      sellerBeats.filter((b: { averageRating: any }) => b.averageRating != null)
        .reduce((sum: number, b: { averageRating: any }) => sum + Number(b.averageRating), 0) /
      (sellerBeats.filter((b: { averageRating: any }) => b.averageRating != null).length || 1);

    await prisma.sellerProfile.update({
      where: { userId: beat.sellerId },
      data: { averageRating: sellerAvgRating },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/reviews:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
