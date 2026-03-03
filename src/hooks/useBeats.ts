import { useState, useEffect, useRef } from "react";

interface Beat {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string | string[];
  mood: string | string[];
  bpm: number;
  key: string;
  tags: string[];
  previewUrl?: string;
  mainFileUrl?: string;
  coverImage?: string;
  // Legacy fields (kept for backward compat in UI)
  audioUrl?: string;
  coverUrl?: string;
  basicPrice?: number;
  premiumPrice?: number;
  exclusivePrice?: number;
  price?: number;
  duration?: number;
  plays: number;
  sales: number;
  createdAt: string;
  status: string;
  seller: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    sellerProfile?: {
      artistName: string;
      verified: boolean;
      averageRating: number | null;
    };
  };
  licenses?: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
  }>;
  _count?: {
    reviews: number;
    favorites: number;
    purchases?: number;
  };
  instruments?: string[];
}

interface BeatsFilters {
  genre?: string;
  mood?: string;
  minBpm?: number;
  maxBpm?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "latest" | "popular" | "price_low" | "price_high";
  page?: number;
  limit?: number;
}

interface BeatsResponse {
  beats: Beat[];
  total: number;
  page: number;
  totalPages: number;
}

export function useBeats(filters?: BeatsFilters) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mémoriser les filtres pour éviter les boucles infinies
  const filtersRef = useRef<string>("");

  useEffect(() => {
    const filtersString = JSON.stringify(filters || {});

    // Ne refetch que si les filtres ont vraiment changé
    if (filtersString === filtersRef.current) {
      return;
    }

    filtersRef.current = filtersString;
    fetchBeats();
  }, [
    filters?.genre,
    filters?.mood,
    filters?.minBpm,
    filters?.maxBpm,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.search,
    filters?.sort,
    filters?.page,
    filters?.limit,
  ]);

  const fetchBeats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.genre) params.append("genre", filters.genre);
      if (filters?.mood) params.append("mood", filters.mood);
      if (filters?.minBpm) params.append("minBpm", filters.minBpm.toString());
      if (filters?.maxBpm) params.append("maxBpm", filters.maxBpm.toString());
      if (filters?.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters?.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sort) params.append("sort", filters.sort);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const res = await fetch(`/api/beats?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement des beats");
      }

      setBeats(data.beats);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchBeats();

  return { beats, total, page, totalPages, loading, error, refetch };
}

export function useBeat(id: string) {
  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBeat();
  }, [id]);

  const fetchBeat = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/beats/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement du beat");
      }

      setBeat(data.beat);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return { beat, loading, error, refetch: fetchBeat };
}
