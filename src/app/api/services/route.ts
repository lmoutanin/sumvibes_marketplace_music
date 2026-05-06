import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const searchQuery = searchParams.get("q");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "9", 10);
        const sellerId = searchParams.get("sellerId");
        const skip = (page - 1) * limit;

        const where: any = {};
        if (sellerId) {
            where.sellerId = sellerId;
        }
        if (category && category !== "all") {
            where.category = category;
        }
        if (searchQuery) {
            where.OR = [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { description: { contains: searchQuery, mode: "insensitive" } },
                { seller: { sellerProfile: { artistName: { contains: searchQuery, mode: "insensitive" } } } },
                { seller: { username: { contains: searchQuery, mode: "insensitive" } } },
                { seller: { displayName: { contains: searchQuery, mode: "insensitive" } } }
            ];
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                include: {
                    seller: {
                        include: {
                            sellerProfile: true
                        }
                    }
                },
                orderBy: [
                    { featured: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma.service.count({ where })
        ]);

        return NextResponse.json({
            services,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Token invalide" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true, subscription: { select: { plan: true } } }
        });

        if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Seuls les vendeurs peuvent proposer un service" }, { status: 403 });
        }

        const plan = user.subscription?.plan || "FREEMIUM";
        if (user.role === "SELLER" && plan !== "PREMIUM_MONTHLY" && plan !== "PREMIUM_YEARLY") {
            return NextResponse.json({ error: "La publication de services est réservée aux producteurs Premium." }, { status: 403 });
        }

        const data = await request.json();
        const { title, description, category, price, deliveryTime, location } = data;

        if (!title || !description || !category || price === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const service = await prisma.service.create({
            data: {
                title,
                description,
                category,
                price,
                deliveryTime,
                location,
                sellerId: decoded.userId,
                featured: false,
            }
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
    }
}
