"use client";

import { useState } from "react";
import { Sparkles, Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/Button";
import { Badge, riskTone } from "@/components/Badge";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/EmptyState";
import { usePredictions } from "@/hooks/usePredictions";
import { useTalents } from "@/hooks/useTalents";
import { errorMessage } from "@/lib/api";
import { dateTimeFR, pct } from "@/lib/format";

export default function PredictionsPage() {
  const { predictions, loading, error, predict } = usePredictions();
  const { talents } = useTalents();
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);

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

  const atRiskTalents = talents
    .filter((t) => t.turnover_risk >= 0.6)
    .sort((a, b) => b.turnover_risk - a.turnover_risk)
    .slice(0, 6);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Prédictions de turnover
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Le modèle RandomForest analyse performance, engagement, satisfaction,
          expérience et salaire pour estimer le risque de départ.
        </p>
      </div>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Quick predict */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">
            Lancer une prédiction sur un talent à risque
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {atRiskTalents.map((t) => (
            <button
              key={t.id}
              onClick={() => run(t.id)}
              disabled={runningId === t.id}
              className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
            >
              <span>
                {t.first_name} {t.last_name}
              </span>
              <Badge tone={riskTone(t.turnover_risk)}>{pct(t.turnover_risk)}</Badge>
              {runningId === t.id ? (
                <Sparkles className="h-4 w-4 animate-pulse text-primary-600" />
              ) : (
                <Play className="h-4 w-4 text-primary-600 group-hover:scale-110" />
              )}
            </button>
          ))}
          {atRiskTalents.length === 0 && (
            <p className="text-sm text-slate-500">
              Aucun talent à risque élevé pour le moment.
            </p>
          )}
        </div>
      </div>

      {/* Predictions list */}
      {error ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Erreur de chargement"
          description={error}
        />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Aucune prédiction"
          description="Lancez une prédiction sur un talent pour voir les résultats ici."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {shown.slice(0, 12).map((p) => {
            const t = talentById(p.talent_id);
            return (
              <div
                key={p.id}
                className={`card p-5 transition ${
                  selected === p.id ? "ring-2 ring-primary-500" : ""
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {t ? `${t.first_name[0]}${t.last_name[0]}` : "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {t ? `${t.first_name} ${t.last_name}` : `Talent #${p.talent_id}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t?.position ?? "—"} · {dateTimeFR(p.predicted_at)}
                      </p>
                    </div>
                  </div>
                  <Badge tone={riskTone(p.score)}>
                    {pct(p.score)} de risque
                  </Badge>
                </div>

                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      p.score >= 0.7
                        ? "bg-red-500"
                        : p.score >= 0.4
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, p.score * 100)}%` }}
                  />
                </div>

                {p.recommendation && (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                    {p.recommendation}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Confiance : {pct(p.confidence)}
                  </p>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
