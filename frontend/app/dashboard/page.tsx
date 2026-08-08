'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://talentpulse-backend.up.railway.app';
      const response = await fetch(`${backendUrl}/api/talents/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <p className="mb-6">Bienvenue, {session?.user?.name || session?.user?.email}!</p>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Total des talents</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Actifs</h3>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">À risque</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.at_risk}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Turnover</h3>
            <p className="text-3xl font-bold text-red-600">{stats.turnover}</p>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Employés</h2>
          <p>Gérez vos employés ici.</p>
          <button
            onClick={() => router.push('/employees')}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Voir les employés
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Prédictions</h2>
          <p>Consultez les prédictions de turnover.</p>
          <button
            onClick={() => router.push('/predictions')}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Voir les prédictions
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Réseau</h2>
          <p>Rejoignez la communauté des DRH.</p>
          <button
            onClick={() => router.push('/network')}
            className="mt-2 bg-purple-500 text-white px-4 py-2 rounded"
          >
            Voir le réseau
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Paramètres</h2>
          <p>Gérez votre compte et vos préférences.</p>
          <button
            onClick={() => router.push('/settings')}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Voir les paramètres
          </button>
        </div>
      </div>
    </div>
  );
}
