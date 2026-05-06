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

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "PENDING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { status: statusParam };

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        include: {
          sellerProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { requestedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/withdrawals:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
