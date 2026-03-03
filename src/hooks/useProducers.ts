import { useState, useEffect } from "react";

interface Producer {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  isVerified: boolean;
  createdAt: string;
  _count?: {
    beats: number;
    sales: number;
  };
  genres?: string[];
  user: {
    id: string;
    displayName?: string;
    username: string;
    avatar?: string;
    beats?: Array<{
      id: string;
      title: string;
      slug: string;
      coverImage?: string;
      bpm?: number;
      genre?: string[];
      mood?: string[];
      basicPrice?: number;
      plays?: number;
    }>;
  };
}

export function useProducers(search?: string) {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducers();
  }, [search]);

  const fetchProducers = async () => {
    try {
      setLoading(true);
      setError(null);

      // On va chercher les utilisateurs avec le rôle SELLER
      const params = new URLSearchParams();
      params.append("role", "SELLER");
      if (search) params.append("search", search);
      params.append("limit", "50");

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Erreur lors du chargement des producteurs",
        );
      }

      setProducers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      // En cas d'erreur, on retourne un tableau vide
      setProducers([]);
    } finally {
      setLoading(false);
    }
  };

  return { producers, loading, error, refetch: fetchProducers };
}

export function useProducer(id: string) {
  const [producer, setProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducer();
  }, [id]);
  const fetchProducer = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Erreur lors du chargement du producteur",
        );
      }

      setProducer(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return { producer, loading, error, refetch: fetchProducer };
}
