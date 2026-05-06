import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getFileStream } from "@/lib/r2";
import archiver from "archiver";
import { PassThrough, Readable } from "stream";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const token =
      req.headers.get("authorization")?.split(" ")[1] ??
      searchParams.get("token") ??
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
        beat: true,
        license: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    if (purchase.buyerId !== decoded.userId && decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (purchase.paymentStatus !== "COMPLETED") {
      return NextResponse.json({ error: "Paiement non complété" }, { status: 400 });
    }

    const lType = purchase.license.type;
    const beat = purchase.beat;

    // Determine files to include in the ZIP based on license
    const filesToInclude: { key: string; name: string }[] = [];
    const safeTitle = beat.title.replace(/[^a-zA-Z0-9._-]/g, "_");

    // All licenses get at least the MP3 (or preview if MP3 missing)
    const mp3Key = beat.mp3FileUrl || beat.previewUrl;
    if (mp3Key) {
      filesToInclude.push({ key: mp3Key, name: `${safeTitle}_High_Quality.mp3` });
    }

    // PREMIUM and EXCLUSIVE get the WAV
    if (lType === "PREMIUM" || lType === "EXCLUSIVE") {
      if (beat.wavFileUrl) {
        filesToInclude.push({ key: beat.wavFileUrl, name: `${safeTitle}_High_Quality.wav` });
      }
    }

    // EXCLUSIVE gets the Trackout (Stems)
    if (lType === "EXCLUSIVE") {
      if (beat.trackoutFileUrl) {
        // Stems is usually already a ZIP
        filesToInclude.push({ key: beat.trackoutFileUrl, name: `${safeTitle}_Stems_Trackout.zip` });
      }
    }

    if (filesToInclude.length === 0) {
      return NextResponse.json({ error: "Aucun fichier disponible pour ce téléchargement" }, { status: 404 });
    }

    // Incrémenter le compteur
    await prisma.purchase.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    // Create a streaming ZIP response
    const archive = archiver("zip", { zlib: { level: 5 } });
    const passThrough = new PassThrough();

    // Pipe archive to passthrough
    archive.pipe(passThrough);

    // Fetch and append each file from R2
    for (const file of filesToInclude) {
      try {
        const stream = await getFileStream(file.key);
        if (stream) {
          archive.append(stream as any, { name: file.name });
        }
      } catch (err) {
        console.error(`Failed to include file ${file.key} in ZIP:`, err);
      }
    }

    // Finalize the archive
    archive.finalize();

    const zipFilename = `${safeTitle}_${lType}_Package.zip`;

    // Convert PassThrough to Web ReadableStream
    // In Node.js environment of Next.js, PassThrough is a Readable
    const stream = Readable.toWeb(passThrough);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
      },
    });

  } catch (error) {
    console.error("Error in GET /api/purchases/[id]/download:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


