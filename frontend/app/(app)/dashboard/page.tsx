"use client";

import { useState } from "react";
import { Users, AlertTriangle, Gauge, TrendingUp, Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { Chart } from "@/components/Chart";
import { TalentTable } from "@/components/TalentTable";
import { Spinner } from "@/components/Spinner";
import { RetentionCopilotDrawer } from "@/components/RetentionCopilotDrawer";
import { useTalents } from "@/hooks/useTalents";
import { pct, eur } from "@/lib/format";
import type { Talent } from "@/lib/types";

export default function DashboardPage() {
  const { talents, stats, loading, error } = useTalents();
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const handleOpenCopilot = (talent: Talent) => {
    setSelectedTalent(talent);
    setIsCopilotOpen(true);
  };

  if (loading) return <Spinner />;

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "Impossible de charger les données."} Vérifiez que le backend
        est démarré, puis rechargez la page.
      </div>
    );
  }

  // Distribution of the current cohort (one talent = one count).
  const riskDistribution = {
    labels: ["Risque faible (<40%)", "Risque modéré (40-70%)", "Risque élevé (≥70%)"],
    datasets: [
      {
        data: [
          talents.filter((t) => t.turnover_risk < 0.4).length,
          talents.filter((t) => t.turnover_risk >= 0.4 && t.turnover_risk < 0.7).length,
          talents.filter((t) => t.turnover_risk >= 0.7).length,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const topRiskTalents = [...talents]
    .sort((a, b) => b.turnover_risk - a.turnover_risk)
    .slice(0, 5);

  const atRiskCount = talents.filter((t) => t.turnover_risk >= 0.7).length;
  const moderateCount = talents.filter(
    (t) => t.turnover_risk >= 0.4 && t.turnover_risk < 0.7
  ).length;

  const avgRisk =
    talents.length > 0
      ? talents.reduce((s, t) => s + t.turnover_risk, 0) / talents.length
      : 0;

  // Estimation financière du risque
  const avgSalary = talents.length > 0 ? talents.reduce((s, t) => s + (t.salary || 45000), 0) / talents.length : 45000;
  const financialRiskEstimate = Math.round(atRiskCount * (avgSalary * 0.5));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header exécutif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Tableau de Bord Exécutif
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Surveillance continue du turnover et diagnostic des risques de départs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/predictions"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 transition"
          >
            <Sparkles className="h-4 w-4 text-primary-600" />
            Lancer un audit prédictif
          </Link>
        </div>
      </div>

      {/* KPI Cards Bento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Talents surveillés"
          value={stats.total}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
          sub={`${stats.active} actifs · ${stats.departments ? Object.keys(stats.departments).length : 0} départements`}
        />
        <StatsCard
          title="Cas critiques (≥70%)"
          value={atRiskCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="red"
          sub={
            financialRiskEstimate > 0
              ? `~${financialRiskEstimate.toLocaleString("fr-FR")} € de risque financier`
              : "Aucune alerte critique"
          }
        />
        <StatsCard
          title="Vigilance modérée"
          value={moderateCount}
          icon={<Gauge className="h-5 w-5" />}
          tone="amber"
          sub="Signaux de désengagement"
        />
        <StatsCard
          title="Score de risque moyen"
          value={pct(avgRisk)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="violet"
          sub="Cohorte globale"
        />
      </div>

      {/* Alertes & Bannière d'Action IA */}
      {atRiskCount > 0 && (
        <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50/50 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-rose-900 text-sm">
                  {atRiskCount} collaborateur{atRiskCount > 1 ? "s" : ""} identifié{atRiskCount > 1 ? "s" : ""} en risque critique de départ
                </p>
                <p className="mt-0.5 text-xs text-rose-700">
                  Des entretiens 1-to-1 ciblés sont recommandés sous 15 jours pour éviter un départ non planifié.
                </p>
              </div>
            </div>

            {topRiskTalents.length > 0 && (
              <button
                onClick={() => handleOpenCopilot(topRiskTalents[0])}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                Ouvrir le plan d'action ({topRiskTalents[0].first_name})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Visualisations & Top Talents */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Doughnut Chart */}
        <div className="card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Répartition des Niveaux de Risque
              </h3>
              <span className="text-xs text-slate-400 font-mono">Modèle ML</span>
            </div>
            <Chart type="doughnut" data={riskDistribution} height={220} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Stable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Modéré
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Critique
            </span>
          </div>
        </div>

        {/* Top Risk Talents List */}
        <div className="card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Top 5 des Talents Prioritaires à Retenir
              </h3>
              <p className="text-xs text-slate-400">Cliquez sur un profil pour ouvrir son plan de rétention IA</p>
            </div>
            <Link
              href="/talents"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Voir tous ({talents.length})
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {topRiskTalents.map((t: Talent, i: number) => (
              <div
                key={t.id}
                onClick={() => handleOpenCopilot(t)}
                className="group flex items-center gap-3.5 rounded-lg border border-slate-100 p-3 hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer transition"
              >
                <span className="w-5 text-center text-xs font-bold text-slate-400">
                  #{i + 1}
                </span>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm">
                  {t.first_name[0]}
                  {t.last_name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition">
                      {t.first_name} {t.last_name}
                    </p>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        t.turnover_risk >= 0.7
                          ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                          : t.turnover_risk >= 0.4
                          ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      }`}
                    >
                      {pct(t.turnover_risk)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{t.position ?? "—"}</span>
                    <span>·</span>
                    <span>{t.department ?? "—"}</span>
                    {t.salary && <span>· {eur(t.salary)}</span>}
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-primary-600 transition">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table complète des talents */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registre des Collaborateurs
            </h3>
            <p className="text-xs text-slate-400">Scores prédictifs et historique</p>
          </div>
          <Link
            href="/talents"
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Accéder à la gestion complète →
          </Link>
        </div>
        <TalentTable
          talents={topRiskTalents}
          onOpenCopilot={handleOpenCopilot}
        />
      </div>

      {/* Drawer Retention Copilot IA */}
      <RetentionCopilotDrawer
        talent={selectedTalent}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}
