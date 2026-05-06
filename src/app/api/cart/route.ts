import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type LicenseType = "BASIC" | "PREMIUM" | "EXCLUSIVE";

/**
 * Retourne le prix réel depuis les champs du beat selon la licence choisie.
 * Fallback : basicPrice si le champ premium/exclusive n'est pas renseigné.
 */
function getPriceForLicense(beat: any, licenseType: LicenseType): number {
  switch (licenseType) {
    case "PREMIUM":
      return Number(beat.premiumPrice ?? beat.basicPrice ?? 0);
    case "EXCLUSIVE":
      return Number(beat.exclusivePrice ?? beat.basicPrice ?? 0);
    case "BASIC":
    default:
      return Number(beat.basicPrice ?? 0);
  }
}

// ─── GET /api/cart ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: decoded.userId },
      include: {
        beat: {
          include: {
            seller: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatar: true,
                sellerProfile: { select: { artistName: true } },
              },
            },
          },
        },
        service: {
          include: {
            seller: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatar: true,
                sellerProfile: { select: { artistName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Total basé sur le price snapshot enregistré à l'ajout
    const total = cartItems.reduce(
      (sum: number, item: any) => sum + Number(item.price ?? 0),
      0
    );

    return NextResponse.json({ cartItems, total });
  } catch (error) {
    console.error("Error in GET /api/cart:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── POST /api/cart ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const body = await req.json();
    const { beatId, serviceId, licenseType, license } = body;
    const requestedLicense = licenseType ?? license ?? "BASIC";

    if (!beatId && !serviceId) {
      return NextResponse.json({ error: "ID du beat ou du service requis" }, { status: 400 });
    }

    if (beatId) {
      // ----------------------------------------------------
      // Logique existante pour ajouter un BEAT
      // ----------------------------------------------------
      const validLicenses: LicenseType[] = ["BASIC", "PREMIUM", "EXCLUSIVE"];
      const normalizedLicense = String(requestedLicense).toUpperCase() as LicenseType;

      if (!validLicenses.includes(normalizedLicense)) {
        return NextResponse.json(
          { error: `Type de licence invalide. Valeurs acceptées : ${validLicenses.join(", ")}` },
          { status: 400 }
        );
      }

      // Récupère le beat avec ses prix
      const beat = await prisma.beat.findUnique({
        where: { id: beatId },
        select: {
          id: true,
          status: true,
          sellerId: true,
          basicPrice: true,
          premiumPrice: true,
          exclusivePrice: true,
        },
      });

      if (!beat || beat.status !== "PUBLISHED") {
        return NextResponse.json({ error: "Beat non disponible" }, { status: 404 });
      }
      if (beat.sellerId === decoded.userId) {
        return NextResponse.json({ error: "Vous ne pouvez pas acheter vos propres beats" }, { status: 400 });
      }

      // Vérifie que la licence demandée a bien un prix renseigné
      const finalPrice = getPriceForLicense(beat, normalizedLicense);
      if (finalPrice <= 0) {
        return NextResponse.json(
          { error: `La licence "${normalizedLicense}" n'est pas disponible pour ce beat` },
          { status: 400 }
        );
      }

      // Vérifie si ce beat + cette licence est déjà dans le panier
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          userId: decoded.userId,
          beatId,
          licenseType: normalizedLicense,
        },
      });
      if (existingCartItem) {
        return NextResponse.json(
          { error: `Ce beat est déjà dans le panier avec la licence "${normalizedLicense}"` },
          { status: 400 }
        );
      }

      // Crée l'item panier avec le prix snapshot
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: decoded.userId,
          beatId,
          licenseType: normalizedLicense,
          price: finalPrice,
        },
        include: { beat: { include: { seller: { select: { id: true, displayName: true, username: true, avatar: true, sellerProfile: { select: { artistName: true } } } } } } },
      });

      return NextResponse.json(cartItem, { status: 201 });

    } else if (serviceId) {
      // ----------------------------------------------------
      // Logique pour ajouter un SERVICE
      // ----------------------------------------------------
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
      }
      if (service.sellerId === decoded.userId) {
        return NextResponse.json({ error: "Vous ne pouvez pas acheter vos propres services" }, { status: 400 });
      }

      // Check if service already exists in cart? 
      // Unlike beats, we might allow multiple of the same service or prevent duplicates. Let's prevent duplicates for now.
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          userId: decoded.userId,
          serviceId,
        },
      });
      if (existingCartItem) {
        return NextResponse.json({ error: `Ce service est déjà dans votre panier` }, { status: 400 });
      }

      const cartItem = await prisma.cartItem.create({
        data: {
          userId: decoded.userId,
          serviceId,
          price: service.price, // the service price
          // License doesn't technically apply, but we default to BASIC
          licenseType: "BASIC",
        },
        include: { service: { include: { seller: { select: { id: true, displayName: true, username: true, avatar: true, sellerProfile: { select: { artistName: true } } } } } } },
      });

      return NextResponse.json(cartItem, { status: 201 });
    }
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");
    if (!cartItemId) return NextResponse.json({ error: "ID de l'article requis" }, { status: 400 });

    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem) return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    if (cartItem.userId !== decoded.userId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return NextResponse.json({ message: "Article retiré du panier" });
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}