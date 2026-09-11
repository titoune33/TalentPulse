"use client";

import { useState } from "react";
import { Sparkles, Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/EmptyState";
import { usePredictions } from "@/hooks/usePredictions";
import { useTalents } from "@/hooks/useTalents";
import { errorMessage } from "@/lib/api";
import { dateTimeFR, pct } from "@/lib/format";
import { Select } from "@/components/Field";
import { Chart, chartPalette } from "@/components/Chart";

export default function PredictionsPage() {
  const { predictions, loading, error, predict } = usePredictions();
  const { talents } = useTalents();
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const talentById = (id: number) => talents.find((t) => t.id === id);

  const run = async (talentId: number) => {
    setRunningId(talentId);
    setNotice(null);
    try {
      const p = await predict(talentId);
      setSelected(p.id);
      setNotice({
        tone: "success",
        text: "Nouvelle prédiction générée avec succès.",
      });
    } catch (e) {
      setNotice({ tone: "error", text: errorMessage(e, "Prédiction impossible") });
    } finally {
      setRunningId(null);
    }
  };

  const sorted = [...predictions].sort(
    (a, b) => new Date(b.predicted_at).getTime() - new Date(a.predicted_at).getTime()
  );

  const shown = selected
    ? sorted.filter((p) => p.id === selected).concat(sorted.filter((p) => p.id !== selected))
    : sorted;

  const filtered = shown.filter((p) => {
    if (riskFilter === "all") return true;
    if (riskFilter === "high") return p.score >= 0.7;
    if (riskFilter === "moderate") return p.score >= 0.4 && p.score < 0.7;
    if (riskFilter === "low") return p.score < 0.4;
    return true;
  });

  const atRiskTalents = talents
    .filter((t) => t.turnover_risk >= 0.6)
    .sort((a, b) => b.turnover_risk - a.turnover_risk)
    .slice(0, 6);

  // Chart data for prediction history trend
  const trendData = {
    labels: ["7 derniers jours", "14 derniers jours", "30 derniers jours"],
    datasets: [
      {
        label: "Risque moyen",
        data: [
          predictions.slice(0, 7).reduce((s, p) => s + p.score, 0) / Math.max(1, predictions.slice(0, 7).length),
          predictions.slice(0, 14).reduce((s, p) => s + p.score, 0) / Math.max(1, predictions.slice(0, 14).length),
          predictions.reduce((s, p) => s + p.score, 0) / Math.max(1, predictions.length),
        ].map((v) => +(v * 100).toFixed(0)),
        borderColor: chartPalette.accent,
        backgroundColor: chartPalette.accentSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-5">
        <p className="eyebrow">Pilotage du risque</p>
        <h2 className="mt-2 text-h2 font-semibold">Prédictions de turnover</h2>
        <p className="mt-1.5 max-w-2xl text-base text-ink-2">
          Le modèle RandomForest lit performance, engagement, satisfaction, expérience et salaire
          pour estimer le risque de départ et hiérarchiser vos actions de rétention.
        </p>
      </header>

      {notice && (
        <div
          role="status"
          className={`border-l-2 bg-surface px-4 py-3 text-small shadow-card ${
            notice.tone === "success"
              ? "border-l-ok-600 text-ink"
              : "border-l-danger-600 text-danger-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Risk trend chart */}
      <section className="card p-6">
        <div className="mb-5">
          <p className="eyebrow">Série historique</p>
          <h3 className="mt-2 text-title font-semibold text-ink">
            Tendance du risque moyen (13 dernières semaines)
          </h3>
        </div>
        <Chart type="line" data={trendData} height={200} />
      </section>

      {/* Quick predict */}
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Action rapide</p>
            <h3 className="mt-2 text-title font-semibold text-ink">
              Lancer une prédiction sur un talent à risque
            </h3>
          </div>
          <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="w-40">
            <option value="all">Tous les risques</option>
            <option value="high">Risque élevé (≥70%)</option>
            <option value="moderate">Risque modéré (40–70%)</option>
            <option value="low">Risque faible (&lt;40%)</option>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {atRiskTalents.map((t) => (
            <button
              key={t.id}
              onClick={() => run(t.id)}
              disabled={runningId === t.id}
              className="group inline-flex items-center gap-2.5 rounded border border-line-strong bg-surface py-1.5 pl-3 pr-2 text-small text-ink-2 shadow-card transition-colors hover:border-ink-4 hover:text-ink disabled:opacity-45"
            >
              <span className="font-medium">
                {t.first_name} {t.last_name}
              </span>
              <span className="figure border-l border-line pl-2.5 text-micro text-ink-3">
                {pct(t.turnover_risk)}
              </span>
              {runningId === t.id ? (
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-ink-4" />
              ) : (
                <Play className="h-3.5 w-3.5 text-ink-4 transition-colors group-hover:text-accent-600" />
              )}
            </button>
          ))}
          {atRiskTalents.length === 0 && (
            <p className="text-small text-ink-3">Aucun talent à risque élevé pour le moment.</p>
          )}
        </div>
      </section>

      {/* Predictions list */}
      {error ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Erreur de chargement"
          description={error}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Aucune prédiction"
          description="Lancez une prédiction sur un talent pour voir les résultats ici."
        />
      ) : (
        <section className="space-y-3">
          <div>
            <p className="eyebrow">Derniers résultats</p>
            <h3 className="mt-2 text-title font-semibold text-ink">
              Historique des prédictions
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filtered.slice(0, 12).map((p) => {
              const t = talentById(p.talent_id);
              const bar =
                p.score >= 0.7 ? "bg-danger-600" : p.score >= 0.4 ? "bg-warn-500" : "bg-ok-600";
              return (
                <article
                  key={p.id}
                  data-testid="prediction-card"
                  className={`card p-4 transition-colors ${
                    selected === p.id ? "border-accent-500" : "hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-small font-medium text-ink">
                        {t ? `${t.first_name} ${t.last_name}` : `Talent #${p.talent_id}`}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-micro tracking-normal text-ink-4">
                        {t?.position ?? "—"} · {dateTimeFR(p.predicted_at)}
                      </p>
                    </div>
                    <p className="figure shrink-0 text-right text-title">
                      {pct(p.score)}
                      <span className="ml-1 font-sans text-micro font-normal uppercase tracking-[0.08em] text-ink-4">
                        de risque
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-sunken">
                    <div
                      className={`h-full rounded-full ${bar}`}
                      style={{ width: `${Math.min(100, p.score * 100)}%` }}
                    />
                  </div>

                  {p.recommendation && (
                    <p className="mt-3 border-l-2 border-line pl-3 text-small leading-relaxed text-ink-2">
                      {p.recommendation}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-micro tracking-normal text-ink-4">
                      <span>Confiance : {pct(p.confidence)}</span>
                      {p.details?.model && <span>Modèle : {p.details.model}</span>}
                    </div>
                    {t && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => run(t.id)}
                        disabled={runningId === t.id}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Relancer
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
