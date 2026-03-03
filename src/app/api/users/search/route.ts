import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  // Auth: check Bearer token (adapt if you use another auth system)
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Search users by username, displayName, or artistName (case-insensitive)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
        { sellerProfile: { artistName: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      sellerProfile: { select: { artistName: true } },
    },
    take: 10,
  });

  return NextResponse.json({ users });
}
