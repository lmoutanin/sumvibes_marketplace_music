import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Vérifier la signature Stripe
    // const signature = req.headers.get('stripe-signature');
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const event = stripe.webhooks.constructEvent(
    //   await req.text(),
    //   signature!,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // Pour le développement, on parse directement le body
    const body = await req.json();
    const event = body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId;
      const items = JSON.parse(session.metadata?.items || "[]");

      // Créer les achats
      for (const item of items) {
        const { beatId, licenseId } = item;

        // Récupérer les infos du beat et de la licence
        const beat = await prisma.beat.findUnique({
          where: { id: beatId },
        });

        const license = await prisma.license.findUnique({
          where: { id: licenseId },
        });

        if (!beat || !license) continue;

        // Calculer la commission (15%)
        const licensePrice = Number(license.price);
        const platformFee = licensePrice * 0.15;
        const sellerEarnings = licensePrice - platformFee;

        // Créer l'achat
        await prisma.purchase.create({
          data: {
            buyerId: userId,
            beatId,
            licenseId,
            amount: licensePrice,
            platformFee,
            sellerEarnings,
            paymentMethod: "STRIPE",
            paymentStatus: "COMPLETED",
            invoiceNumber: generateInvoiceNumber(),
          },
        });

        // Mettre à jour le beat
        await prisma.beat.update({
          where: { id: beatId },
          data: {
            sales: { increment: 1 },
            status: license.type === "EXCLUSIVE" ? ("ARCHIVED" as any) : beat.status,
          },
        });

        // Mettre à jour le profil vendeur (via userId = beat.sellerId)
        await prisma.sellerProfile.update({
          where: { userId: beat.sellerId },
          data: {
            totalSales: { increment: 1 },
            totalRevenue: { increment: sellerEarnings },
          },
        });
      }

      // Vider le panier
      await prisma.cartItem.deleteMany({
        where: {
          userId,
          beatId: { in: items.map((i: { beatId: string }) => i.beatId) },
        },
      });

      // TODO: Envoyer un email de confirmation avec les liens de téléchargement
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error in POST /api/stripe/webhook:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
