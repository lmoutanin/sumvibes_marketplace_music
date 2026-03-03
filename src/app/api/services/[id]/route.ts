import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const service = await prisma.service.findUnique({
            where: {
                id,
            },
            include: {
                seller: {
                    include: {
                        sellerProfile: true
                    }
                }
            }
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error("Error fetching service:", error);
        return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        // Verify Authentication
        const userHeaderStr = request.headers.get("x-user");
        let userId = null;
        let role = null;

        if (userHeaderStr) {
            try {
                const userObj = JSON.parse(userHeaderStr);
                userId = userObj.id;
                role = userObj.role;
            } catch (e) { }
        } else {
            // fallback token verification in case middleware didn't intercept correctly or passed raw token
            const token = request.headers.get("authorization")?.split(" ")[1];
            if (token) {
                const { verifyToken } = await import("@/lib/auth");
                const decoded = verifyToken(token);
                if (decoded) {
                    userId = decoded.userId;
                    role = decoded.role;
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        // Verify service exists & owner
        const existingService = await prisma.service.findUnique({ where: { id } });
        if (!existingService) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }
        if (role !== "ADMIN" && existingService.sellerId !== userId) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        const data = await request.json();
        const { title, description, category, price, deliveryTime, location } = data;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = price;
        if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
        if (location !== undefined) updateData.location = location;

        const updatedService = await prisma.service.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ service: updatedService });

    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
    }
}
