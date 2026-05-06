import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/stats
 * Public endpoint — returns real platform-wide stats, top producers, and recent reviews.
 */
export async function GET() {
  try {
    const [
      totalBeats,
      totalUsers,
      totalSales,
      activeProducers,
      topProducers,
      latestReviews,
    ] = await Promise.all([
      prisma.beat.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.purchase.count(),
      prisma.sellerProfile.count(),
      // Top producers by total sales
      prisma.sellerProfile.findMany({
        orderBy: { totalSales: "desc" },
        take: 4,
        select: {
          totalSales: true,
          artistName: true,
          averageRating: true,
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      // Recent positive reviews
      prisma.review.findMany({
        where: { rating: { gte: 4 }, comment: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
              sellerProfile: { select: { artistName: true } },
            },
          },
          beat: {
            select: { title: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalBeats,
      totalUsers,
      totalSales,
      activeProducers,
      topProducers,
      latestReviews,
    });
  } catch (error) {
    console.error("Error in GET /api/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
