import { NextRequest, NextResponse } from "next/server";
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

    // Récupérer l'utilisateur depuis la DB
    const prisma = (await import("@/lib/prisma")).default;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        bio: true,
        website: true,
        phone: true,
        instagram: true,
        twitter: true,
        youtube: true,
        country: true,
        twoFactorEnabled: true,
        notificationPrefs: true,
        musicPrefs: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        sellerProfile: {
          select: {
            artistName: true,
            description: true,
            genres: true,
            paypalEmail: true,
            totalSales: true,
            totalRevenue: true,
            averageRating: true,
            verified: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      firstName, lastName, displayName, email, bio, website, phone, instagram, twitter, youtube, country,
      twoFactorEnabled, notificationPrefs, musicPrefs,
      artistName, description, genres, paypalEmail 
    } = body;

    const prisma = (await import("@/lib/prisma")).default;

    // Check user role
    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        firstName,
        lastName,
        displayName,
        email,
        bio,
        website,
        phone,
        instagram,
        twitter,
        youtube,
        country,
        // Only update these if they are explicitly sent in the payload
        ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
        ...(notificationPrefs !== undefined && { notificationPrefs }),
        ...(musicPrefs !== undefined && { musicPrefs }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        website: true,
        phone: true,
        instagram: true,
        twitter: true,
        youtube: true,
        country: true,
        twoFactorEnabled: true,
        notificationPrefs: true,
        musicPrefs: true,
        avatar: true,
        emailVerified: true,
      }
    });

    // If user is SELLER, update seller profile
    let updatedSellerProfile = null;
    if (existingUser.role === "SELLER" && artistName) {
      updatedSellerProfile = await prisma.sellerProfile.upsert({
        where: { userId: decoded.userId },
        update: {
          artistName,
          description,
          genres: genres || [],
          paypalEmail,
        },
        create: {
          userId: decoded.userId,
          artistName,
          description,
          genres: genres || [],
          paypalEmail,
        },
        select: {
          artistName: true,
          description: true,
          genres: true,
          paypalEmail: true,
          totalSales: true,
          totalRevenue: true,
          averageRating: true,
          verified: true,
        }
      });
    }

    return NextResponse.json({ 
      user: {
        ...updatedUser,
        sellerProfile: updatedSellerProfile
      } 
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const prisma = (await import("@/lib/prisma")).default;

    // Verify user exists before deleting
    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Delete the user
    // Prisma `onDelete: Cascade` handles all related records (SellerProfile, Beats, Purchases, etc.)
    await prisma.user.delete({
      where: { id: decoded.userId }
    });

    return NextResponse.json({ success: true, message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la suppression du compte" }, { status: 500 });
  }
}
