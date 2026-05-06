import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { role: true } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "week": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "year": startDate = new Date(now.getFullYear(), 0, 1); break;
      default:     startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [
      totalUsers,
      totalSellers,
      totalBeats,
      publishedBeats,
      pendingBeats,
      totalSales,
      totalRevenue,
      platformRevenue,
      recentSales,
      topSellers,
      topBeats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sellerProfile.count(),
      prisma.beat.count({ where: { status: { not: "DELETED" } } }),
      prisma.beat.count({ where: { status: "PUBLISHED" } }),
      prisma.beat.count({ where: { status: "PENDING" as any } }),
      prisma.purchase.count(),
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.purchase.aggregate({ _sum: { platformFee: true } }),
      // Ventes récentes
      prisma.purchase.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          beat: { select: { id: true, title: true, coverImage: true } },
          buyer: { select: { id: true, displayName: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      // Top vendeurs
      prisma.sellerProfile.findMany({
        orderBy: { totalRevenue: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, displayName: true, username: true, avatar: true } },
        },
      }),
      // Top beats
      prisma.beat.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { sales: "desc" },
        take: 10,
        include: {
          seller: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
              sellerProfile: { select: { artistName: true } },
            },
          },
        },
      }),
    ]);

    const salesThisPeriod = await prisma.purchase.aggregate({
      where: { createdAt: { gte: startDate } },
      _sum: { amount: true, platformFee: true },
      _count: true,
    });

    const newUsersThisPeriod = await prisma.user.count({ where: { createdAt: { gte: startDate } } });
    const newBeatsThisPeriod = await prisma.beat.count({ where: { createdAt: { gte: startDate } } });

    const salesByDayRaw = await prisma.purchase.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, amount: true, platformFee: true },
      orderBy: { createdAt: "asc" },
    });

    // Grouper par jour côté JS
    const salesByDayMap = new Map<string, { count: number; revenue: number; commission: number }>();
    for (const s of salesByDayRaw) {
      const date = s.createdAt.toISOString().split("T")[0];
      const existing = salesByDayMap.get(date) || { count: 0, revenue: 0, commission: 0 };
      salesByDayMap.set(date, {
        count: existing.count + 1,
        revenue: existing.revenue + Number(s.amount),
        commission: existing.commission + Number(s.platformFee),
      });
    }
    const salesByDay = Array.from(salesByDayMap.entries()).map(([date, v]) => ({
      date,
      count: v.count,
      revenue: v.revenue,
      commission: v.commission,
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        totalSellers,
        totalBeats,
        publishedBeats,
        pendingBeats,
        totalSales,
        totalRevenue: totalRevenue._sum.amount || 0,
        platformRevenue: platformRevenue._sum.platformFee || 0,
      },
      period: {
        sales: salesThisPeriod._count,
        revenue: salesThisPeriod._sum.amount || 0,
        commission: salesThisPeriod._sum.platformFee || 0,
        newUsers: newUsersThisPeriod,
        newBeats: newBeatsThisPeriod,
        startDate,
        endDate: now,
      },
      recentSales,
      topSellers,
      topBeats,
      salesByDay,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
