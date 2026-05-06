import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Auth: check Bearer token (adapt if you use another auth system)
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all users (limit 100 for safety)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      sellerProfile: { select: { artistName: true } },
    },
    take: 100,
  });

  return NextResponse.json({ users });
}
