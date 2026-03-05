import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Accept token from Authorization header OR ?token= query param (for <a> links)
    const token =
      req.headers.get("authorization")?.split(" ")[1] ??
      req.nextUrl.searchParams.get("token") ??
      undefined;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { id } = await params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        beat: {
          select: {
            id: true,
            title: true,
            mainFileUrl: true,
          },
        },
        license: {
          select: { type: true },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    if (purchase.buyerId !== decoded.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (purchase.paymentStatus !== "COMPLETED") {
      return NextResponse.json({ error: "Paiement non complété" }, { status: 400 });
    }

    const fileUrl = purchase.beat.mainFileUrl;
    if (!fileUrl) {
      return NextResponse.json({ error: "Fichier non disponible" }, { status: 404 });
    }

    // Incrémenter le compteur
    await prisma.purchase.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    // URL externe → redirection directe
    if (fileUrl.startsWith("http")) {
      return NextResponse.redirect(fileUrl);
    }

    // Fichier local stocké dans /public
    const filePath = path.join(process.cwd(), "public", fileUrl);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Fichier introuvable sur le serveur" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(fileUrl).toLowerCase();
    const contentType =
      ext === ".mp3" ? "audio/mpeg" :
      ext === ".wav" ? "audio/wav" :
      "application/octet-stream";
    const safeName = `${purchase.beat.title.replace(/[^a-zA-Z0-9._-]/g, "_")}_${purchase.license?.type ?? "LICENSE"}${ext}`;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/purchases/[id]/download:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

