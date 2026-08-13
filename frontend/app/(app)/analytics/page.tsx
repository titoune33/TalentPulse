"use client";

import { useMemo } from "react";
import { Chart } from "@/components/Chart";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/EmptyState";
import { AlertTriangle, BarChart3, Users, TrendingUp, Calendar } from "lucide-react";
import { useTalents } from "@/hooks/useTalents";
import { usePredictions } from "@/hooks/usePredictions";
import { pct } from "@/lib/format";
import { Badge, riskTone } from "@/components/Badge";

export default function AnalyticsPage() {
  const { talents, stats, loading, error } = useTalents();
  const { predictions } = usePredictions();

  const byDepartment = useMemo(() => {
    const map = new Map<string, { total: number; atRisk: number }>();
    for (const t of talents) {
      const dept = t.department ?? "Non défini";
      const cur = map.get(dept) ?? { total: 0, atRisk: 0 };
      cur.total += 1;
      if (t.turnover_risk >= 0.7) cur.atRisk += 1;
      map.set(dept, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, ratio: v.atRisk / Math.max(1, v.total) }))
      .sort((a, b) => b.ratio - a.ratio);
  }, [talents]);

  const trend = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; avg: number }[] = [];
    for (let w = 12; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(now.getDate() - w * 7 - 6);
      const end = new Date(now);
      end.setDate(now.getDate() - w * 7);
      const inWeek = predictions.filter((p) => {
        const d = new Date(p.predicted_at);
        return d >= start && d <= end;
      });
      const avg = inWeek.length
        ? inWeek.reduce((s, p) => s + p.score, 0) / inWeek.length
        : 0;
      weeks.push({
        label: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(start),
        avg,
      });
    }
    return weeks;
  }, [predictions]);

  if (loading) return <Spinner />;

  if (error || !stats) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-8 w-8" />}
        title="Erreur"
        description={error ?? "Données indisponibles"}
      />
    );
  }

  const deptData = {
    labels: byDepartment.map((d) => d.name),
    datasets: [
      {
        label: "Talents",
        data: byDepartment.map((d) => d.total),
        backgroundColor: "#cbd5e1",
        borderRadius: 6,
      },
      {
        label: "À risque",
        data: byDepartment.map((d) => d.atRisk),
        backgroundColor: "#ef4444",
        borderRadius: 6,
      },
    ],
  };

  const trendData = {
    labels: trend.map((w) => w.label),
    datasets: [
      {
        label: "Risque moyen",
        data: trend.map((w) => +(w.avg * 100).toFixed(0)),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.08)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const perfData = {
    labels: ["Performance", "Engagement", "Satisfaction"],
    datasets: [
      {
        label: "Moyenne équipe (%)",
        data: [
          +(stats.avg_performance * 100).toFixed(0),
          +(stats.avg_engagement * 100).toFixed(0),
          +((talents.reduce((s, t) => s + t.satisfaction_score, 0) / Math.max(1, talents.length)) * 100).toFixed(0),
        ],
        backgroundColor: ["#6366f1", "#8b5cf6", "#10b981"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold text-slate-900">Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tendances du risque de turnover et répartition par équipe.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">
              Évolution du risque moyen (13 semaines)
            </h3>
          </div>
          <Chart type="line" data={trendData} height={260} />
        </div>
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">
              Indicateurs clés de l'équipe
            </h3>
          </div>
          <Chart type="bar" data={perfData} height={260} />
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900">Risque par département</h3>
        </div>
        <Chart type="bar" data={deptData} height={280} options={{
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
        }} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 font-semibold">Département</th>
                <th className="py-2 font-semibold">Effectif</th>
                <th className="py-2 font-semibold">À risque</th>
                <th className="py-2 font-semibold">Taux de risque</th>
              </tr>
            </thead>
            <tbody>
              {byDepartment.map((d) => (
                <tr key={d.name} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 font-medium text-slate-800">{d.name}</td>
                  <td className="py-2.5 text-slate-600">{d.total}</td>
                  <td className="py-2.5 text-slate-600">{d.atRisk}</td>
                  <td className="py-2.5">
                    <Badge tone={d.ratio >= 0.5 ? "red" : d.ratio >= 0.25 ? "amber" : "green"}>
                      {pct(d.ratio)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
