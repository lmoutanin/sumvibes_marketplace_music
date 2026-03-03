import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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

    const body = await req.json();
    const { items } = body; // [{ beatId, licenseId }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Articles du panier requis" },
        { status: 400 }
      );
    }

    // Récupérer les détails de chaque article
    const lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const beat = await prisma.beat.findUnique({
        where: { id: item.beatId },
        include: {
          seller: {
            select: {
              displayName: true,
              sellerProfile: { select: { artistName: true } },
            },
          },
        },
      });

      const license = item.licenseId
        ? await prisma.license.findUnique({ where: { id: item.licenseId } })
        : await prisma.license.findFirst({ where: { beatId: item.beatId }, orderBy: { price: "asc" } });

      if (!beat || beat.status !== "PUBLISHED") continue;
      const price = license?.price ?? beat.basicPrice;

      lineItems.push({
        beatId: beat.id,
        licenseId: license?.id ?? "",
        title: beat.title,
        seller: beat.seller.sellerProfile?.artistName || beat.seller.displayName,
        licenseName: license?.name ?? "Basic",
        price,
      });

      totalAmount += Number(price);
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "Aucun article valide dans le panier" },
        { status: 400 }
      );
    }

    // TODO: Créer une session de paiement Stripe
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: lineItems.map(item => ({
    //     price_data: {
    //       currency: 'eur',
    //       product_data: {
    //         name: `${item.title} - ${item.licenseName}`,
    //         description: `Beat by ${item.seller}`,
    //       },
    //       unit_amount: Math.round(item.price * 100),
    //     },
    //     quantity: 1,
    //   })),
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    //   client_reference_id: decoded.userId,
    //   metadata: {
    //     userId: decoded.userId,
    //     items: JSON.stringify(lineItems.map(i => ({ beatId: i.beatId, licenseId: i.licenseId }))),
    //   },
    // });

    // Pour le développement, retourner une session simulée
    const session = {
      id: `cs_test_${Date.now()}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/confirmation?session_id=cs_test_${Date.now()}`,
      amount_total: Math.round(totalAmount * 100),
      currency: "eur",
      payment_status: "unpaid",
    };

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error in POST /api/stripe/checkout:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
