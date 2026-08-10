"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Prediction, PredictionStats } from "@/lib/types";

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, sRes] = await Promise.all([
        api.get<Prediction[]>("/api/predictions/recent", { params: { limit: 200 } }),
        api.get<PredictionStats>("/api/predictions/stats"),
      ]);
      setPredictions(pRes.data);
      setStats(sRes.data);
    } catch {
      setError("Impossible de charger les prédictions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const predict = useCallback(async (talentId: number) => {
    const { data } = await api.post<Prediction>(`/api/predictions/talents/${talentId}`);
    setPredictions((prev) => [data, ...prev]);
    return data;
  }, []);

  const history = useCallback(async (talentId: number) => {
    const { data } = await api.get<Prediction[]>(`/api/predictions/talents/${talentId}`);
    return data;
  }, []);

  const highRisk = useCallback(async (minRisk = 0.7) => {
    const { data } = await api.get<Prediction[]>("/api/predictions/high-risk", {
      params: { min_risk: minRisk },
    });
    return data;
  }, []);

  return { predictions, stats, loading, error, fetchRecent, predict, history, highRisk };
}
