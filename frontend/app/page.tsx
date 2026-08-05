'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (status === 'authenticated') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur TalentPulse</h1>
        <p className="text-xl mb-8">La plateforme tout-en-un pour les DRH</p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Se connecter
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
}
