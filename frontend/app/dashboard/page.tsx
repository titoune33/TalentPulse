'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <p className="mb-4">Bienvenue, {session?.user?.name || session?.user?.email}!</p>
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
          <h2 className="text-xl font-semibold mb-2">Réseau</h2>
          <p>Rejoignez la communauté des DRH.</p>
          <button
            onClick={() => router.push('/network')}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Voir le réseau
          </button>
        </div>
      </div>
    </div>
  );
}
