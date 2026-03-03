import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const [post, comments, total] = await Promise.all([
      prisma.forumPost.findUnique({
        where: { id: postId },
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
        },
      }),
      prisma.forumComment.findMany({
        where: { postId },
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
        },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumComment.count({ where: { postId } }),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Incrémenter les vues
    await prisma.forumPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      post: { ...post, views: post.views + 1 },
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/forum/posts/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await req.json();
    const { title, content } = body;

    // Récupérer le post
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (post.authorId !== decoded.userId) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce post" },
        { status: 403 }
      );
    }

    // Mettre à jour le post
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        title: title?.trim(),
        content: content?.trim(),
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error in PUT /api/forum/posts/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { id: postId } = await params;

    // Récupérer le post
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Récupérer l'utilisateur pour vérifier si admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    // Vérifier que l'utilisateur est l'auteur ou admin
    if (post.authorId !== decoded.userId && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce post" },
        { status: 403 }
      );
    }

    // Supprimer le post (et les commentaires en cascade)
    await prisma.forumPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: "Post supprimé avec succès" });
  } catch (error) {
    console.error("Error in DELETE /api/forum/posts/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
