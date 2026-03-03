import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { LoginData } from '@/types/auth';

export async function POST(request: NextRequest) {
    try {
        const body: LoginData = await request.json();

        // Validation
        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: body.email },
            include: {
                sellerProfile: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Check if account is suspended or deleted
        if (user.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Ce compte est suspendu ou désactivé' },
                { status: 403 }
            );
        }

        // Verify password
        const isPasswordValid = await comparePassword(body.password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Return user data (without password)
        const { passwordHash, ...userWithoutPassword } = user;

        return NextResponse.json({
            message: 'Connexion réussie',
            user: userWithoutPassword,
            token,
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la connexion' },
            { status: 500 }
        );
    }
}
