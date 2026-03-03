import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { id: withdrawalId } = await params;
    const body = await req.json();
    const { status, transactionId } = body;

    if (!status || !["COMPLETED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Récupérer la demande de retrait
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        sellerProfile: true,
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Demande de retrait non trouvée" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette demande a déjà été traitée" },
        { status: 400 }
      );
    }

    // Mettre à jour la demande
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: status as any,
        processedAt: new Date(),
        ...(transactionId && { stripeTransferId: transactionId }),
      },
    });

    // Si rejeté, rembourser le solde du vendeur (via totalRevenue si besoin)
    // Note: SellerProfile n'a pas de champ balance — on logue seulement
    if (status === "REJECTED") {
      // Aucun champ balance sur SellerProfile — juste logger
      console.log(`Withdrawal ${withdrawalId} rejected for sellerProfile ${withdrawal.sellerProfileId}`);
    }

    // TODO: Envoyer une notification au vendeur
    // TODO: Envoyer un email de confirmation

    return NextResponse.json(updatedWithdrawal);
  } catch (error) {
    console.error("Error in PUT /api/admin/withdrawals/[id]/process:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
