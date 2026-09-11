"use client";

import { useMemo } from "react";
import { Chart, chartPalette } from "@/components/Chart";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/EmptyState";
import { AlertTriangle } from "lucide-react";
import { useTalents } from "@/hooks/useTalents";
import { usePredictions } from "@/hooks/usePredictions";
import { pct } from "@/lib/format";

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
        backgroundColor: chartPalette.muted,
        borderColor: chartPalette.grid,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "À risque",
        data: byDepartment.map((d) => d.atRisk),
        backgroundColor: chartPalette.danger,
        borderColor: chartPalette.grid,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const trendData = {
    labels: trend.map((w) => w.label),
    datasets: [
      {
        label: "Risque moyen",
        data: trend.map((w) => +(w.avg * 100).toFixed(0)),
        borderColor: chartPalette.accent,
        backgroundColor: chartPalette.accentSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointBackgroundColor: chartPalette.accent,
        pointBorderColor: chartPalette.accent,
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
        backgroundColor: chartPalette.accent,
        borderColor: chartPalette.grid,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* En-tête de page — cf. DESIGN.md §5 */}
      <header className="border-b border-line pb-5">
        <p className="eyebrow">Pilotage du risque</p>
        <h2 className="mt-2 text-h2 font-semibold">Analytics</h2>
        <p className="mt-1.5 max-w-2xl text-base text-ink-2">
          Identifiez les dynamiques de risque par équipe pour cibler les plans de rétention.
        </p>
      </header>

      {/* Tendance — lecture linéaire sur 13 semaines */}
      <section className="card p-5">
        <h3 className="text-title font-semibold">Évolution du risque moyen (13 semaines)</h3>
        <p className="mt-0.5 text-small text-ink-3">
          Score prédictif moyen de la cohorte, semaine par semaine.
        </p>
        <div className="mt-4">
          <Chart type="line" data={trendData} height={260} />
        </div>
      </section>

      {/* Indicateurs d'équipe & risque par département */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="text-title font-semibold">Indicateurs clés de l'équipe</h3>
          <p className="mt-0.5 text-small text-ink-3">
            Moyennes de cohorte, en pourcentage du maximum.
          </p>
          <div className="mt-4">
            <Chart type="bar" data={perfData} height={260} />
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-title font-semibold">Risque par département</h3>
          <p className="mt-0.5 text-small text-ink-3">
            Effectif total et part en risque élevé, empilés par équipe.
          </p>
          <div className="mt-4">
            <Chart type="bar" data={deptData} height={260} options={{
              scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
            }} />
          </div>
        </section>
      </div>

      {/* Détail chiffré par département */}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="eyebrow">Détail par équipe</p>
            <h3 className="mt-1.5 text-title font-semibold">Exposition des départements</h3>
          </div>
          <p className="text-small text-ink-3">
            {byDepartment.length} département{byDepartment.length > 1 ? "s" : ""} · seuil critique 70%
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-small">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-2.5 font-mono text-micro font-medium uppercase tracking-[0.09em] text-ink-3">
                  Département
                </th>
                <th className="px-5 py-2.5 text-right font-mono text-micro font-medium uppercase tracking-[0.09em] text-ink-3">
                  Effectif
                </th>
                <th className="px-5 py-2.5 text-right font-mono text-micro font-medium uppercase tracking-[0.09em] text-ink-3">
                  À risque
                </th>
                <th className="px-5 py-2.5 text-right font-mono text-micro font-medium uppercase tracking-[0.09em] text-ink-3">
                  Taux de risque
                </th>
              </tr>
            </thead>
            <tbody>
              {byDepartment.map((d) => (
                <tr key={d.name} className="border-b border-line transition-colors last:border-0 hover:bg-sunken">
                  <td className="px-5 py-2.5 font-medium text-ink">{d.name}</td>
                  <td className="figure px-5 py-2.5 text-right text-ink-2">{d.total}</td>
                  <td className="figure px-5 py-2.5 text-right text-ink-2">{d.atRisk}</td>
                  <td
                    className={`figure px-5 py-2.5 text-right ${
                      d.ratio >= 0.5
                        ? "text-danger-600"
                        : d.ratio >= 0.25
                        ? "text-warn-600"
                        : "text-ok-600"
                    }`}
                  >
                    {pct(d.ratio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
