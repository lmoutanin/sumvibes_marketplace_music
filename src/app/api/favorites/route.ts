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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: decoded.userId },
        include: {
          beat: {
            include: {
              seller: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                  avatar: true,
                  sellerProfile: {
                    select: {
                      artistName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.favorite.count({ where: { userId: decoded.userId } }),
    ]);

    return NextResponse.json({
      favorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/favorites:", error);
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
    const { beatId } = body;

    if (!beatId) {
      return NextResponse.json(
        { error: "ID du beat requis" },
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

    // Vérifier si déjà en favoris
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_beatId: {
          userId: decoded.userId,
          beatId,
        },
      },
    });

    if (existingFavorite) {
      // Retirer des favoris
      await prisma.favorite.delete({
        where: {
          userId_beatId: {
            userId: decoded.userId,
            beatId,
          },
        },
      });

      return NextResponse.json({ message: "Retiré des favoris", favorited: false });
    } else {
      // Ajouter aux favoris
      const favorite = await prisma.favorite.create({
        data: {
          userId: decoded.userId,
          beatId,
        },
      });

      return NextResponse.json({ favorite, favorited: true }, { status: 201 });
    }
  } catch (error) {
    console.error("Error in POST /api/favorites:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
