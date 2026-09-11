"use client";

import { useState } from "react";
import { Users, AlertTriangle, Gauge, TrendingUp, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { Chart, chartPalette } from "@/components/Chart";
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
      <div className="card border-danger-100 bg-danger-50 p-6 text-small text-danger-700">
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
        backgroundColor: [chartPalette.ok, chartPalette.warn, chartPalette.danger],
        borderColor: chartPalette.grid,
        borderWidth: 2,
        hoverOffset: 2,
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
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête de page — cf. DESIGN.md §5 */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Pilotage du risque</p>
          <h2 className="mt-2 text-h2 font-semibold">Tableau de Bord Exécutif</h2>
          <p className="mt-1.5 max-w-2xl text-base text-ink-2">
            Arbitrez où concentrer les entretiens de rétention ce mois-ci.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/predictions" className="btn-secondary">
            <Sparkles className="h-3.5 w-3.5 text-accent-600" />
            Lancer un audit prédictif
          </Link>
        </div>
      </header>

      {/* Bandeau de KPI */}
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
          tone="slate"
          sub="Cohorte globale"
        />
      </div>

      {/* Alerte critique + déclenchement du plan d'action */}
      {atRiskCount > 0 && (
        <div className="card border-l-2 border-l-danger-600 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" aria-hidden />
              <div>
                <p className="text-small font-semibold text-ink">
                  {atRiskCount} collaborateur{atRiskCount > 1 ? "s" : ""} identifié{atRiskCount > 1 ? "s" : ""} en risque critique de départ
                </p>
                <p className="mt-0.5 text-small text-ink-2">
                  Des entretiens 1-to-1 ciblés sont recommandés sous 15 jours pour éviter un départ non planifié.
                </p>
              </div>
            </div>

            {topRiskTalents.length > 0 && (
              <button
                onClick={() => handleOpenCopilot(topRiskTalents[0])}
                className="btn-primary shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ouvrir le plan d'action ({topRiskTalents[0].first_name})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Répartition du risque & priorités de rétention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <h3 className="text-title font-semibold">Répartition des Niveaux de Risque</h3>

          <div className="mt-4">
            <Chart type="doughnut" data={riskDistribution} height={220} />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-small text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ok-600" aria-hidden /> Stable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-warn-500" aria-hidden /> Modéré
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-danger-600" aria-hidden /> Critique
            </span>
          </div>
        </section>

        <section className="card p-5 lg:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-title font-semibold">
                Top 5 des Talents Prioritaires à Retenir
              </h3>
              <p className="mt-0.5 text-small text-ink-3">
                Ouvrez un profil pour construire son plan de rétention.
              </p>
            </div>
            <Link
              href="/talents"
              className="inline-flex items-center gap-1.5 text-small font-medium text-accent-600 hover:text-accent-700"
            >
              Voir tous ({talents.length})
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ul className="mt-3 divide-y divide-line">
            {topRiskTalents.map((t: Talent, i: number) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => handleOpenCopilot(t)}
                  aria-label={`Ouvrir le plan de rétention de ${t.first_name} ${t.last_name}`}
                  className="group -mx-2 flex w-full items-center gap-3.5 rounded px-2 py-2.5 text-left transition-colors hover:bg-sunken"
                >
                  <span className="figure w-5 shrink-0 text-right text-small text-ink-3">
                    {i + 1}
                  </span>

                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line bg-sunken font-mono text-micro font-medium text-ink-2"
                  >
                    {t.first_name[0]}
                    {t.last_name[0]}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-small font-medium text-ink group-hover:text-accent-600">
                        {t.first_name} {t.last_name}
                      </span>
                      <span
                        className={`figure shrink-0 text-small ${
                          t.turnover_risk >= 0.7
                            ? "text-danger-600"
                            : t.turnover_risk >= 0.4
                            ? "text-warn-600"
                            : "text-ok-600"
                        }`}
                      >
                        {pct(t.turnover_risk)}
                      </span>
                    </span>

                    <span className="mt-0.5 flex items-center gap-2 text-small text-ink-3">
                      <span className="truncate">{t.position ?? "—"}</span>
                      <span aria-hidden>·</span>
                      <span>{t.department ?? "—"}</span>
                      {t.salary && <span className="figure">· {eur(t.salary)}</span>}
                    </span>
                  </span>

                  <Sparkles
                    className="h-4 w-4 shrink-0 text-ink-4 transition-colors group-hover:text-accent-600"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Registre détaillé des talents prioritaires */}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="eyebrow">Détail</p>
            <h3 className="mt-1.5 text-title font-semibold">Registre des Collaborateurs</h3>
            <p className="mt-0.5 text-small text-ink-3">
              Scores prédictifs, statut et leviers d'action des profils prioritaires.
            </p>
          </div>
          <Link
            href="/talents"
            className="inline-flex items-center gap-1.5 text-small font-medium text-accent-600 hover:text-accent-700"
          >
            Accéder à la gestion complète
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <TalentTable
          talents={topRiskTalents}
          onOpenCopilot={handleOpenCopilot}
        />
      </section>

      {/* Drawer Retention Copilot IA */}
      <RetentionCopilotDrawer
        talent={selectedTalent}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}
