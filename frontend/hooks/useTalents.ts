"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Talent, TalentInput, TalentStats } from "@/lib/types";

export function useTalents() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [stats, setStats] = useState<TalentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, sRes] = await Promise.all([
        api.get<Talent[]>("/api/talents/"),
        api.get<TalentStats>("/api/talents/stats"),
      ]);
      setTalents(tRes.data);
      setStats(sRes.data);
    } catch {
      setError("Impossible de charger les talents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (input: TalentInput) => {
    const { data } = await api.post<Talent>("/api/talents/", input);
    setTalents((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: number, input: TalentInput) => {
    const { data } = await api.put<Talent>(`/api/talents/${id}`, input);
    setTalents((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, []);

  const remove = useCallback(async (id: number) => {
    await api.delete(`/api/talents/${id}`);
    setTalents((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const search = useCallback(async (q: string) => {
    const { data } = await api.get<Talent[]>("/api/talents/search", {
      params: { q },
    });
    return data;
  }, []);

  return { talents, stats, loading, error, fetchAll, create, update, remove, search };
}
