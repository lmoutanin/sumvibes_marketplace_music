import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (search) {
      where.OR = [
        { artistName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [profiles, total] = await Promise.all([
      prisma.sellerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              username: true,
              avatar: true,
              role: true,
              createdAt: true,
              beats: {
                orderBy: { createdAt: "desc" },
                take: 3,
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  coverImage: true,
                  bpm: true,
                  genre: true,
                  mood: true,
                  basicPrice: true,
                  plays: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sellerProfile.count({ where }),
    ]);

    return NextResponse.json({
      users: profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
};
