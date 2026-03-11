import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const signatureData = (body as { signatureData?: string }).signatureData || "";
    if (!signatureData.startsWith("data:image/png;base64,")) {
      return NextResponse.json(
        { error: "Signature invalide (format attendu: data:image/png;base64,...)" },
        { status: 400 }
      );
    }

    if (signatureData.length > 1_000_000) {
      return NextResponse.json({ error: "Signature trop volumineuse" }, { status: 400 });
    }

    const prisma = (await import("@/lib/prisma")).default;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, displayName: true, username: true },
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.sellerProfile.upsert({
      where: { userId: decoded.userId },
      update: {
        signatureData,
        signatureUrl: null,
      },
      create: {
        userId: decoded.userId,
        artistName: user.displayName || user.username || "Artiste",
        genres: [],
        signatureData,
      },
    });

    return NextResponse.json({ message: "Signature enregistrée en base" });
  } catch (error: any) {
    console.error("Error in POST /api/auth/signature-drawn:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}
