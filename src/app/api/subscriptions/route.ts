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
        const { plan } = body;

        const allowedPlans = ["PREMIUM_MONTHLY", "PREMIUM_YEARLY", "STANDARD_MONTHLY", "STANDARD_YEARLY"];

        if (!plan || !allowedPlans.includes(plan)) {
            return NextResponse.json({ error: "Choix de plan invalide" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { subscription: true },
        });

        if (!user || (user.role !== "BUYER" && user.role !== "SELLER")) {
            return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
        }

        // Mode développement : Simulation du paiement immédiat
        const now = new Date();
        const nextPeriod = new Date();
        if (plan.includes("MONTHLY")) {
            nextPeriod.setMonth(now.getMonth() + 1);
        } else {
            nextPeriod.setFullYear(now.getFullYear() + 1);
        }

        const updatedSubscription = await prisma.subscription.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                plan,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: nextPeriod,
                cancelAtPeriodEnd: false
            },
            update: {
                plan,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: nextPeriod,
                cancelAtPeriodEnd: false
            }
        });

        return NextResponse.json({
            success: true,
            message: "Abonnement activé avec succès (Mode Dev)",
            subscription: updatedSubscription
        });
    } catch (error) {
        console.error("Error creating subscription:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
