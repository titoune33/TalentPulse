'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PredictionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [highRiskOnly, setHighRiskOnly] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchPredictions();
    }
  }, [status, router, highRiskOnly]);

  const fetchPredictions = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://talentpulse-backend.up.railway.app';
      let url = `${backendUrl}/api/predictions/recent`;
      if (highRiskOnly) {
        url = `${backendUrl}/api/predictions/high-risk`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setPredictions(data || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerPrediction = async (talentId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://talentpulse-backend.up.railway.app';
      const response = await fetch(`${backendUrl}/api/predictions/talents/${talentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (response.ok) {
        fetchPredictions();
      }
    } catch (error) {
      console.error("Error triggering prediction:", error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prédictions de Turnover</h1>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={highRiskOnly}
            onChange={(e) => setHighRiskOnly(e.target.checked)}
            className="mr-2"
          />
          <span>Afficher uniquement les prédictions à haut risque (>70%)</span>
        </label>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Liste des prédictions</h2>
        {predictions.length === 0 ? (
          <p>Aucune prédiction trouvée.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID Talent</th>
                <th className="p-2 border">Score de risque</th>
                <th className="p-2 border">Confiance</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Recommandation</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map(prediction => (
                <tr key={prediction.id} className="border">
                  <td className="p-2">{prediction.talent_id}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-white ${prediction.score > 0.7 ? 'bg-red-500' : prediction.score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {(prediction.score * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-2">{(prediction.confidence * 100).toFixed(1)}%</td>
                  <td className="p-2">{prediction.prediction_type}</td>
                  <td className="p-2">{new Date(prediction.predicted_at).toLocaleDateString()}</td>
                  <td className="p-2 max-w-xs truncate">{prediction.recommendation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
