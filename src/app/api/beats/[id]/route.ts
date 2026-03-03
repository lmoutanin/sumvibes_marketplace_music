import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export async function PATCH(request: NextRequest, context: any) {
  try {
    // Supporte tous les cas (Promise, objet direct, etc.)
    let ctx = context;
    if (typeof ctx?.then === "function") ctx = await ctx;
    let params = ctx?.params;
    if (typeof params?.then === "function") params = await params;
    const id = params?.id;
    console.log("[PATCH /api/beats/[id]] params:", params, "id:", id);
    if (!id || typeof id !== "string") {
      // Helper pour extraire la string d'un champ FormData (tableau ou string)
      function getField(val: any) {
        if (Array.isArray(val)) return val[0];
        return val;
      }
      return NextResponse.json(
        { error: "ID manquant ou invalide" },
        { status: 400 },
      );
    }
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const beat = await prisma.beat.findUnique({ where: { id } });
    if (!beat)
      return NextResponse.json({ error: "Beat introuvable" }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });
    if (!user)
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );

    if (beat.sellerId !== decoded.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    let data: any = {};
    let coverImage: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // --- Parse le form-data (cover + champs texte) ---
      try {
        const uploadDir = path.join(process.cwd(), "public/uploads/covers");
        if (!fs.existsSync(uploadDir))
          fs.mkdirSync(uploadDir, { recursive: true });
        const form = new IncomingForm({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
        });

        // Bufferise le body
        const buffer = Buffer.from(await request.arrayBuffer());
        // formidable attend un stream, on lui donne un Readable
        const { Readable } = require("stream");
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        // Crée un faux objet req avec headers pour formidable
        const fakeReq = Object.assign(stream, {
          headers: Object.fromEntries(request.headers.entries()),
        });
        const parsed = await new Promise((resolve, reject) => {
          form.parse(fakeReq, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
          });
        });
        // @ts-ignore
        data = parsed.fields;
        // @ts-ignore
        const files = parsed.files;
        if (files.cover && files.cover[0]) {
          // @ts-ignore
          const file = files.cover[0];
          coverImage = path.basename(file.filepath);
        } else {
          coverImage = beat.coverImage;
        }
      } catch (err) {
        console.error("Erreur upload cover:", err);
        let msg = "";
        if (err instanceof Error) {
          msg = err.message;
        } else if (typeof err === "string") {
          msg = err;
        } else {
          msg = JSON.stringify(err);
        }
        return NextResponse.json(
          { error: "Erreur upload cover: " + msg },
          { status: 500 },
        );
      }
    } else {
      // --- JSON classique ---
      try {
        data = await request.json();
      } catch {
        return NextResponse.json(
          { error: "Le body doit être du JSON valide." },
          { status: 400 },
        );
      }
      coverImage = data.coverImage ?? beat.coverImage;
    }

    // Helper pour extraire la string d'un champ FormData (tableau ou string)
    function getField(val: any) {
      if (Array.isArray(val)) return val[0];
      return val;
    }
    // Correction des types pour Prisma
    const updateData: any = {
      title: getField(data.title) ?? beat.title,
      description: getField(data.description) ?? beat.description,
      genre: Array.isArray(data.genre)
        ? data.genre
        : data.genre
          ? [data.genre]
          : beat.genre,
      mood: Array.isArray(data.mood)
        ? data.mood
        : data.mood
          ? [data.mood]
          : beat.mood,
      bpm: data.bpm ? Number(getField(data.bpm)) : beat.bpm,
      key: getField(data.key) ?? beat.key,
      tags: Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === "string"
          ? data.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : beat.tags,
      coverImage,
      status: getField(data.status) ?? beat.status,
      seoTitle: getField(data.seoTitle) ?? beat.seoTitle,
      seoDescription: getField(data.seoDescription) ?? beat.seoDescription,
      basicPrice: data.basicPrice
        ? Number(getField(data.basicPrice))
        : beat.basicPrice,
      premiumPrice: data.premiumPrice
        ? Number(getField(data.premiumPrice))
        : beat.premiumPrice,
      exclusivePrice: data.exclusivePrice
        ? Number(getField(data.exclusivePrice))
        : beat.exclusivePrice,
      duration: data.duration ? Number(getField(data.duration)) : beat.duration,
    };

    const updated = await prisma.beat.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ beat: updated });
  } catch (error) {
    console.error("Update beat by id error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const beat = await prisma.beat.findUnique({ where: { id } });
    if (!beat)
      return NextResponse.json({ error: "Beat introuvable" }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });
    if (!user)
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );

    if (beat.sellerId !== decoded.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.beat.update({ where: { id }, data: { status: "DELETED" } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete beat by id error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}