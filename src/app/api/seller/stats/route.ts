import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un vendeur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Seuls les vendeurs ont accès à ces statistiques" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // month, week, year

    // Date de début selon la période
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Statistiques globales
    const [
      sellerProfile,
      totalBeats,
      publishedBeats,
      pendingBeats,
      totalPlays,
      recentSales,
      topBeats,
    ] = await Promise.all([
      prisma.sellerProfile.findUnique({
        where: { userId: decoded.userId },
      }),
      prisma.beat.count({
        where: { sellerId: decoded.userId, status: { not: "DELETED" } },
      }),
      prisma.beat.count({
        where: { sellerId: decoded.userId, status: "PUBLISHED" },
      }),
      prisma.beat.count({
        where: { sellerId: decoded.userId, status: "PENDING" as any },
      }),
      prisma.beat.aggregate({
        where: { sellerId: decoded.userId },
        _sum: { plays: true },
      }),
      // Ventes récentes (via beat.sellerId)
      prisma.purchase.findMany({
        where: {
          beat: { sellerId: decoded.userId },
          createdAt: { gte: startDate },
        },
        include: {
          beat: {
            select: { id: true, title: true, coverImage: true },
          },
          buyer: {
            select: { id: true, displayName: true, username: true, avatar: true },
          },
          license: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Top beats par ventes
      prisma.beat.findMany({
        where: { sellerId: decoded.userId, status: "PUBLISHED" },
        orderBy: { sales: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          genre: true,
          bpm: true,
          plays: true,
          sales: true,
        },
      }),
    ]);

    // Calcul des revenus de la période
    const salesThisPeriod = await prisma.purchase.aggregate({
      where: {
        beat: { sellerId: decoded.userId },
        createdAt: { gte: startDate },
      },
      _sum: { sellerEarnings: true },
      _count: true,
    });

    // Graphique des ventes (par jour pour le mois)
    const salesByDayRaw = await prisma.purchase.findMany({
      where: {
        beat: { sellerId: decoded.userId },
        createdAt: { gte: startDate },
        paymentStatus: "COMPLETED" as any,
      },
      select: {
        createdAt: true,
        sellerEarnings: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Grouper par jour côté JS
    const salesByDayMap = new Map<string, { count: number; revenue: number }>();
    for (const s of salesByDayRaw) {
      const date = s.createdAt.toISOString().split("T")[0];
      const existing = salesByDayMap.get(date) || { count: 0, revenue: 0 };
      salesByDayMap.set(date, {
        count: existing.count + 1,
        revenue: existing.revenue + Number(s.sellerEarnings),
      });
    }
    const salesByDay = Array.from(salesByDayMap.entries()).map(([date, v]) => ({
      date,
      count: v.count,
      revenue: v.revenue,
    }));

    return NextResponse.json({
      overview: {
        totalRevenue: sellerProfile?.totalRevenue || 0,
        totalSales: sellerProfile?.totalSales || 0,
        averageRating: sellerProfile?.averageRating || 0,
        totalBeats,
        publishedBeats,
        pendingBeats,
        totalPlays: totalPlays._sum.plays || 0,
      },
      period: {
        revenue: salesThisPeriod._sum.sellerEarnings || 0,
        sales: salesThisPeriod._count,
        startDate,
        endDate: now,
      },
      recentSales,
      topBeats,
      salesByDay,
    });
  } catch (error) {
    console.error("Error in GET /api/seller/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
