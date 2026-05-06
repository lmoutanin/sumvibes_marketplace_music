import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get("authorization")?.split(" ")[1];
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { id } = await context.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                sellerProfile: { select: { artistName: true } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
