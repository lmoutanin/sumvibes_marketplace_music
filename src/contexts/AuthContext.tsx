"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  website?: string | null;
  phone?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  country?: string | null;
  avatar?: string | null;
  createdAt?: string;
  twoFactorEnabled?: boolean;
  notificationPrefs?: any;
  musicPrefs?: any;
  sellerProfile?: {
    artistName: string;
    description: string | null;
    genres: string[];
    paypalEmail?: string | null;
    totalSales: number;
    totalRevenue: number | string;
    averageRating: number | string | null;
    verified: boolean;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le token au montage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? data);
        setToken(authToken);
      } else {
        // Token invalide
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      await fetchUser(storedToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
