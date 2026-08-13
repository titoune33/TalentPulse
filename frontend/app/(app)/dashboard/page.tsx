"use client";

import { Users, AlertTriangle, Gauge, HeartHandshake, Sparkles, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { Chart } from "@/components/Chart";
import { TalentTable } from "@/components/TalentTable";
import { Spinner } from "@/components/Spinner";
import { useTalents } from "@/hooks/useTalents";
import { usePredictions } from "@/hooks/usePredictions";
import { pct, eur } from "@/lib/format";
import type { Talent } from "@/lib/types";

export default function DashboardPage() {
  const { talents, stats, loading, error } = useTalents();
  const { predictions } = usePredictions();

  if (loading) return <Spinner />;

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        {error ?? "Impossible de charger les données."} Vérifiez que le backend
        est démarré, puis rechargez la page.
      </div>
    );
  }

  const riskDistribution = {
    labels: ["Risque faible", "Risque modéré", "Risque élevé"],
    datasets: [
      {
        data: [
          predictions.filter((p) => p.score < 0.4).length,
          predictions.filter((p) => p.score >= 0.4 && p.score < 0.7).length,
          predictions.filter((p) => p.score >= 0.7).length,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const recent = [...talents]
    .sort((a, b) => b.turnover_risk - a.turnover_risk)
    .slice(0, 5);

  const atRiskCount = talents.filter((t) => t.turnover_risk >= 0.7).length;
  const moderateCount = talents.filter(
    (t) => t.turnover_risk >= 0.4 && t.turnover_risk < 0.7
  ).length;

  // Score moyen de risque
  const avgRisk = talents.length > 0
    ? talents.reduce((s, t) => s + t.turnover_risk, 0) / talents.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header premium */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Bonjour 👋
        </h2>
        <p className="text-sm text-slate-500">
          Voici l'état de vos équipes et les risques de départ détectés aujourd'hui.
        </p>
      </div>

      {/* Stats cards premium */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Talents suivis"
          value={stats.total}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
          sub={`${stats.active} actifs · ${stats.departments ? Object.keys(stats.departments).length : 0} départements`}
        />
        <StatsCard
          title="À risque élevé"
          value={atRiskCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="red"
          sub={`${stats.at_risk} signalés`}
        />
        <StatsCard
          title="Risque modéré"
          value={moderateCount}
          icon={<Gauge className="h-5 w-5" />}
          tone="amber"
          sub="40–70% de risque"
        />
        <StatsCard
          title="Risque moyen"
          value={pct(avgRisk)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="violet"
          sub="de toute l'équipe"
        />
      </div>

      {/* Alertes premium */}
      {atRiskCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">
                {atRiskCount} talent{atRiskCount > 1 ? "s" : ""} à risque élevé
              </p>
              <p className="mt-0.5 text-sm text-red-700">
                Un entretien prioritaire est recommandé pour les talents en rouge.
                Consultez la page{" "}
                <Link href="/predictions" className="underline">
                  Prédictions
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Répartition des risques
          </h3>
          <Chart type="doughnut" data={riskDistribution} height={240} />
        </div>
        <div className="card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Top 5 des talents les plus à risque
            </h3>
            <Link
              href="/talents?sort=risk&order=desc"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Voir tous les talents →
            </Link>
          </div>
          <div className="space-y-3">
            {recent.map((t: Talent, i: number) => (
              <div key={t.id} className="flex items-center gap-4">
                <span className="w-6 text-center text-sm font-bold text-slate-400">
                  #{i + 1}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {t.first_name[0]}
                  {t.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {t.first_name} {t.last_name}
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        t.turnover_risk >= 0.7
                          ? "text-red-600"
                          : t.turnover_risk >= 0.4
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {pct(t.turnover_risk)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        t.turnover_risk >= 0.7
                          ? "bg-red-500"
                          : t.turnover_risk >= 0.4
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${t.turnover_risk * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span>{t.position ?? "—"}</span>
                    <span>·</span>
                    <span>{t.department ?? "—"}</span>
                    {t.salary && <span>· {eur(t.salary)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent talents table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-900">
            Tous les talents (par risque)
          </h3>
          <Link
            href="/talents"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            Gérer les talents
          </Link>
        </div>
        <TalentTable talents={recent} />
      </div>
    </div>
  );
}
