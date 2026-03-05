import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        website: true,
        instagram: true,
        twitter: true,
        youtube: true,
        createdAt: true,
        role: true,
        sellerProfile: {
          select: {
            artistName: true,
            description: true,
            genres: true,
            verified: true,
            totalSales: true,
            totalRevenue: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
    });

    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Producteur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ producer: user });
  } catch (error) {
    console.error("Error in GET /api/producers/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
