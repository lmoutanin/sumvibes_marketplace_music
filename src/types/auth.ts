import { User, UserRole, SellerProfile } from '@prisma/client';

export type UserWithProfile = User & {
    sellerProfile?: SellerProfile | null;
};

export interface AuthUser {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    displayName?: string | null;
    avatar?: string | null;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export interface RegisterData {
    email: string;
    username?: string;
    artistName?: string;
    password: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    gdprConsent?: boolean;
    marketingConsent?: boolean;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface BeatFilters {
    genre?: string[];
    mood?: string[];
    bpm?: {
        min?: number;
        max?: number;
    };
    priceRange?: {
        min?: number;
        max?: number;
    };
    search?: string;
    sellerId?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
