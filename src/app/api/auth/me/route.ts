import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

function hasText(value: unknown) {
  return String(value ?? "").trim().length > 0;
}

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
        address: true,
        city: true,
        postalCode: true,
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
            signatureUrl: true,
            signatureData: true,
            totalSales: true,
            totalRevenue: true,
            averageRating: true,
            verified: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    let currentMonthUploads = 0;
    if (user.role === "SELLER") {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      currentMonthUploads = await prisma.beat.count({
        where: {
          sellerId: user.id,
          createdAt: { gte: startOfMonth },
        },
      });
    }

    return NextResponse.json({ user: { ...user, currentMonthUploads } });
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
      firstName, lastName, displayName, email, bio, website, phone, instagram, twitter, youtube, country, address, city, postalCode,
      twoFactorEnabled, notificationPrefs, musicPrefs,
      artistName, description, genres, paypalEmail, signatureUrl, signatureData
    } = body;

    const prisma = (await import("@/lib/prisma")).default;

    // Check user role
    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        role: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        sellerProfile: {
          select: {
            signatureData: true,
          },
        },
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const profileKeys = [
      "firstName",
      "lastName",
      "displayName",
      "email",
      "phone",
      "address",
      "city",
      "postalCode",
      "artistName",
      "description",
      "genres",
      "paypalEmail",
      "signatureData",
      "signatureUrl",
    ];

    const isProfileUpdate = profileKeys.some((k) =>
      Object.prototype.hasOwnProperty.call(body, k),
    );

    if (existingUser.role === "SELLER" && isProfileUpdate) {
      const finalFirstName = Object.prototype.hasOwnProperty.call(body, "firstName") ? firstName : existingUser.firstName;
      const finalLastName = Object.prototype.hasOwnProperty.call(body, "lastName") ? lastName : existingUser.lastName;
      const finalDisplayName = Object.prototype.hasOwnProperty.call(body, "displayName") ? displayName : existingUser.displayName;
      const finalEmail = Object.prototype.hasOwnProperty.call(body, "email") ? email : existingUser.email;
      const finalPhone = Object.prototype.hasOwnProperty.call(body, "phone") ? phone : existingUser.phone;
      const finalAddress = Object.prototype.hasOwnProperty.call(body, "address") ? address : existingUser.address;
      const finalCity = Object.prototype.hasOwnProperty.call(body, "city") ? city : existingUser.city;
      const finalPostalCode = Object.prototype.hasOwnProperty.call(body, "postalCode") ? postalCode : existingUser.postalCode;
      const finalSignatureData = Object.prototype.hasOwnProperty.call(body, "signatureData")
        ? signatureData
        : existingUser.sellerProfile?.signatureData;

      const missing: string[] = [];
      if (!hasText(finalFirstName)) missing.push("firstName");
      if (!hasText(finalLastName)) missing.push("lastName");
      if (!hasText(finalDisplayName)) missing.push("displayName");
      if (!hasText(finalEmail)) missing.push("email");
      if (!hasText(finalPhone)) missing.push("phone");
      if (!hasText(finalAddress)) missing.push("address");
      if (!hasText(finalCity)) missing.push("city");
      if (!hasText(finalPostalCode)) missing.push("postalCode");
      if (!hasText(finalSignatureData)) missing.push("signatureData");

      if (missing.length > 0) {
        return NextResponse.json(
          {
            error: "Champs obligatoires manquants pour un beatmaker.",
            missing,
          },
          { status: 400 },
        );
      }
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
        address,
        city,
        postalCode,
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
        address: true,
        city: true,
        postalCode: true,
        twoFactorEnabled: true,
        notificationPrefs: true,
        musicPrefs: true,
        avatar: true,
        emailVerified: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          }
        }
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
          ...(signatureUrl !== undefined && { signatureUrl }),
          ...(signatureData !== undefined && { signatureData }),
        },
        create: {
          userId: decoded.userId,
          artistName,
          description,
          genres: genres || [],
          paypalEmail,
          ...(signatureUrl !== undefined && { signatureUrl }),
          ...(signatureData !== undefined && { signatureData }),
        },
        select: {
          artistName: true,
          description: true,
          genres: true,
          paypalEmail: true,
          signatureUrl: true,
          signatureData: true,
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
