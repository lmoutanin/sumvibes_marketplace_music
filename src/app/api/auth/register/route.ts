import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { RegisterData } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();

    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "Prénom et nom requis" },
        { status: 400 },
      );
    }

    if (body.role === "BUYER" && !body.username) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur est requis" },
        { status: 400 },
      );
    }

    if (body.role === "SELLER" && !body.artistName) {
      return NextResponse.json(
        { error: "Le nom d'artiste est requis" },
        { status: 400 },
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 },
      );
    }

    // Check if user already exists
    let existingUser;
    if (body.role === "SELLER") {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: body.email }, { displayName: body.artistName }],
        },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Cet email ou nom d'artiste existe déjà" },
          { status: 409 },
        );
      }
    } else {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: body.email }, { username: body.username }],
        },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Cet email ou nom d'utilisateur existe déjà" },
          { status: 409 },
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Create user
    let user;
    if (body.role === "SELLER") {
      user = await prisma.user.create({
        data: {
          email: body.email,
          username: body.artistName || "",
          passwordHash,
          role: "SELLER",
          firstName: body.firstName,
          lastName: body.lastName,
          displayName: body.artistName || "",
          gdprConsent: body.gdprConsent || true,
          marketingConsent: body.marketingConsent || false,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          displayName: true,
          avatar: true,
          createdAt: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: body.email,
          username: body.username || "",
          passwordHash,
          role: "BUYER",
          firstName: body.firstName,
          lastName: body.lastName,
          displayName: "",
          gdprConsent: body.gdprConsent || true,
          marketingConsent: body.marketingConsent || false,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          displayName: true,
          avatar: true,
          createdAt: true,
        },
      });
    }

    // If seller, create seller profile
    if (body.role === "SELLER") {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          artistName: body.artistName || "",
          description: "",
          genres: [],
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: "Inscription réussie",
        user,
        token,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 },
    );
  }
}
