import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "audio", "cover", "stems"

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    // Validation du type de fichier
    // Restriction stricte pour les images : PNG/JPG uniquement
    const allowedTypes: Record<string, string[]> = {
      audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"],
      cover: ["image/jpeg", "image/jpg", "image/png"],
      stems: ["application/zip", "application/x-zip-compressed"],
    };

    if (!type || !allowedTypes[type]) {
      return NextResponse.json(
        { error: "Type de fichier invalide" },
        { status: 400 },
      );
    }

    if (!allowedTypes[type].includes(file.type)) {
      return NextResponse.json(
        {
          error: `Format de fichier non supporté pour ${type}. Seuls PNG et JPG sont acceptés pour les images.`,
        },
        { status: 400 },
      );
    }

    // Validation de la taille (50 MB max pour audio, 5 MB pour images, 500 MB pour stems)
    const maxSizes: Record<string, number> = {
      audio: 50 * 1024 * 1024,
      cover: 5 * 1024 * 1024,
      stems: 500 * 1024 * 1024,
    };

    if (file.size > maxSizes[type]) {
      return NextResponse.json(
        {
          error: `Le fichier est trop volumineux (max ${maxSizes[type] / 1024 / 1024} MB)`,
        },
        { status: 400 },
      );
    }

    // Déterminer le dossier de destination
    let uploadDir: string;
    let url: string;
    if (type === "cover") {
      uploadDir = path.join(process.cwd(), "public", "cover-beats");
    } else {
      uploadDir = path.join(process.cwd(), "public", "uploads", `${type}s`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${decoded.userId.slice(0, 8)}-${sanitizedName}`;
    const filePath = path.join(uploadDir, fileName);

    // Créer le dossier si inexistant
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    if (type === "cover") {
      url = `/cover-beats/${fileName}`;
    } else {
      url = `/uploads/${type}s/${fileName}`;
    }

    return NextResponse.json({
      url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Error in POST /api/upload:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
