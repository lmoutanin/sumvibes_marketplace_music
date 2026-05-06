import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/community/stats
 * Public endpoint — returns platform-wide community counts + top sellers + featured services.
 */
export async function GET() {
  try {
    const [
      totalUsers,
      totalPosts,
      totalServices,
      topSellers,
      featuredServices,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.forumPost.count(),
      prisma.service.count(),
      // Top sellers by total sales
      prisma.sellerProfile.findMany({
        orderBy: { totalSales: "desc" },
        take: 3,
        include: {
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
      // Featured services (featured first, then latest)
      prisma.service.findMany({
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          price: true,
          deliveryTime: true,
          location: true,
          rating: true,
          reviewsCount: true,
          featured: true,
          sellerId: true,
          seller: {
            select: {
              id: true,
              displayName: true,
              username: true,
              sellerProfile: {
                select: { artistName: true },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPosts,
        totalServices,
      },
      topSellers,
      featuredServices,
    });
  } catch (error) {
    console.error("Error in GET /api/community/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
