import { useState, useEffect } from 'react';

interface PlatformStats {
  totalUsers: number;
  totalBeats: number;
  totalSales: number;
  totalRevenue: number;
  activeProducers: number;
  averageRating: number;
  recentActivity: {
    newUsers: number;
    newBeats: number;
    sales: number;
  };
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        // Si pas de token admin, on retourne des stats par défaut
        setStats({
          totalUsers: 5000,
          totalBeats: 10000,
          totalSales: 50000,
          totalRevenue: 1500000,
          activeProducers: 2500,
          averageRating: 4.8,
          recentActivity: {
            newUsers: 150,
            newBeats: 200,
            sales: 890,
          },
        });
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des statistiques');
      }

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // En cas d'erreur, on met des stats par défaut
      setStats({
        totalUsers: 5000,
        totalBeats: 10000,
        totalSales: 50000,
        totalRevenue: 1500000,
        activeProducers: 2500,
        averageRating: 4.8,
        recentActivity: {
          newUsers: 150,
          newBeats: 200,
          sales: 890,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
}
