import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
              role: true,
              sellerProfile: { select: { artistName: true } },
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/forum/posts:", error);
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
    const { title, content, category } = body;

    // Validation
    if (!title || title.trim().length < 5) {
      return NextResponse.json(
        { error: "Le titre doit contenir au moins 5 caractères" },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 20) {
      return NextResponse.json(
        { error: "Le contenu doit contenir au moins 20 caractères" },
        { status: 400 }
      );
    }

    if (
      !category ||
      !["PRODUCTION", "MARKETING", "EQUIPMENT", "COLLABORATION", "OTHER"].includes(
        category
      )
    ) {
      return NextResponse.json(
        { error: "Catégorie invalide" },
        { status: 400 }
      );
    }

    // Créer le post
    const slug = `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}-${Date.now()}`;
    const post = await prisma.forumPost.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        category,
        authorId: decoded.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
            role: true,
            sellerProfile: { select: { artistName: true } },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/forum/posts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
