import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const cartItems = await prisma.cartItem.findMany({
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
                sellerProfile: { select: { artistName: true } },
              },
            },
            licenses: {
              take: 1,
              orderBy: { price: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = cartItems.reduce(
      (sum: number, item: any) => sum + Number(item.beat?.licenses?.[0]?.price ?? item.beat?.basicPrice ?? 0),
      0
    );

    return NextResponse.json({ cartItems, total });
  } catch (error) {
    console.error("Error in GET /api/cart:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const body = await req.json();
    const { beatId } = body;

    if (!beatId) return NextResponse.json({ error: "ID du beat requis" }, { status: 400 });

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat || beat.status !== "PUBLISHED") return NextResponse.json({ error: "Beat non disponible" }, { status: 404 });
    if (beat.sellerId === decoded.userId) return NextResponse.json({ error: "Vous ne pouvez pas acheter vos propres beats" }, { status: 400 });

    const existingCartItem = await prisma.cartItem.findUnique({
      where: { userId_beatId: { userId: decoded.userId, beatId } },
    });
    if (existingCartItem) return NextResponse.json({ error: "Déjà dans le panier" }, { status: 400 });

    const cartItem = await prisma.cartItem.create({
      data: { userId: decoded.userId, beatId },
      include: {
        beat: {
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
            licenses: { take: 1, orderBy: { price: "asc" } },
          },
        },
      },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");
    if (!cartItemId) return NextResponse.json({ error: "ID de l'article requis" }, { status: 400 });

    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem) return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    if (cartItem.userId !== decoded.userId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return NextResponse.json({ message: "Article retiré du panier" });
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
