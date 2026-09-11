"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Sliders,
} from "lucide-react";
import { Button } from "./Button";
import { pct, eur } from "@/lib/format";
import type { Talent } from "@/lib/types";

interface RetentionCopilotDrawerProps {
  talent: Talent | null;
  isOpen: boolean;
  onClose: () => void;
}

/** Normalise a 0-1 score onto the /10 scale managers actually think in. */
const onTen = (score: number | null | undefined) => ((score ?? 0) * 10).toFixed(1);

export function RetentionCopilotDrawer({
  talent,
  isOpen,
  onClose,
}: RetentionCopilotDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [salaryAdj, setSalaryAdj] = useState(0); // percent, -5 → +20
  const [targetSatisfaction, setTargetSatisfaction] = useState(5); // /10

  useEffect(() => {
    if (talent) {
      setSalaryAdj(0);
      setTargetSatisfaction(Math.round((talent.satisfaction_score ?? 0) * 20) / 2);
    }
  }, [talent]);

  if (!isOpen || !talent) return null;

  const satisfaction = talent.satisfaction_score ?? 0;
  const engagement = talent.engagement_score ?? 0;
  const performance = talent.performance_score ?? 0;

  const currentRisk = talent.turnover_risk;

  /**
   * Illustrative what-if sensitivities, not a retrained model output.
   * Keeping the coefficients in one place makes that honest and auditable.
   */
  const simulatedRisk = Math.min(
    0.98,
    Math.max(
      0.05,
      currentRisk - salaryAdj * 0.012 - (targetSatisfaction / 10 - satisfaction) * 0.45
    )
  );
  const riskDrop = Math.max(0, currentRisk - simulatedRisk);

  const fullName = `${talent.first_name} ${talent.last_name}`;
  const initials = `${talent.first_name[0] ?? ""}${talent.last_name[0] ?? ""}`.toUpperCase();

  const severity =
    currentRisk >= 0.7
      ? { label: "Risque critique", cls: "text-danger-700", dot: "bg-danger-600" }
      : currentRisk >= 0.4
        ? { label: "Vigilance requise", cls: "text-warn-700", dot: "bg-warn-500" }
        : { label: "Situation stable", cls: "text-ok-700", dot: "bg-ok-600" };

  const handleCopyPlan = () => {
    const text = `Plan de rétention — ${fullName} (${talent.position ?? "Poste non défini"}, ${talent.department ?? "Département non défini"})
Risque de départ estimé : ${pct(currentRisk)} (score RandomForest)
Facteurs clés : satisfaction ${onTen(satisfaction)}/10 · engagement ${onTen(engagement)}/10 · salaire ${eur(talent.salary)} · ancienneté ${talent.experience_years} ans
Questions recommandées pour l'entretien 1-to-1 :
1. Comment perçois-tu l'évolution de tes responsabilités pour les 6 prochains mois ?
2. Quels sont les irritants majeurs dans tes projets actuels ?
Simulation de contre-mesure : revalorisation ${salaryAdj > 0 ? `+${salaryAdj}%` : `${salaryAdj}%`} et objectif de satisfaction ${targetSatisfaction}/10 → risque estimé ${pct(simulatedRisk)}.`;

    void navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 animate-fadeIn bg-graphite-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Plan de rétention"
        className="relative flex h-full w-full max-w-[560px] animate-slideInRight flex-col overflow-hidden border-l border-line bg-surface shadow-float"
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-[13px] font-medium text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-title font-semibold text-ink">{fullName}</h3>
              <p className="truncate text-small text-ink-3">
                {talent.position ?? "Poste non défini"}
                {talent.department ? ` · ${talent.department}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="-mr-1 rounded-md p-1.5 text-ink-3 transition hover:bg-sunken hover:text-ink"
            aria-label="Fermer le panneau"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Risk summary */}
          <section className="rounded-xl border border-line bg-paper p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-micro font-medium uppercase tracking-[0.09em] text-ink-3">
                  Risque de départ estimé
                </p>
                <p className="figure mt-2 text-[2.75rem] leading-none">{pct(currentRisk)}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${severity.dot}`} aria-hidden />
                <span className={`font-mono text-[11px] font-medium uppercase tracking-wide ${severity.cls}`}>
                  {severity.label}
                </span>
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4">
              <div>
                <dt className="text-micro uppercase tracking-[0.08em] text-ink-4">Satisfaction</dt>
                <dd className="figure mt-1 text-[15px]">
                  {onTen(satisfaction)} <span className="text-ink-4">/ 10</span>
                </dd>
              </div>
              <div>
                <dt className="text-micro uppercase tracking-[0.08em] text-ink-4">Engagement</dt>
                <dd className="figure mt-1 text-[15px]">
                  {onTen(engagement)} <span className="text-ink-4">/ 10</span>
                </dd>
              </div>
              <div>
                <dt className="text-micro uppercase tracking-[0.08em] text-ink-4">Performance</dt>
                <dd className="figure mt-1 text-[15px]">
                  {onTen(performance)} <span className="text-ink-4">/ 10</span>
                </dd>
              </div>
            </dl>
            <p className="mt-4 font-mono text-[11px] text-ink-4">
              Score RandomForest · ancienneté {talent.experience_years} ans · {eur(talent.salary)}
            </p>
          </section>

          {/* Recommendations */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-small font-semibold text-ink">
                <Sparkles className="h-3.5 w-3.5 text-accent-600" />
                Recommandations stratégiques
              </h4>
              <button
                onClick={handleCopyPlan}
                className="inline-flex items-center gap-1.5 text-micro font-medium uppercase tracking-wide text-accent-600 transition hover:text-accent-700"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>

            <div className="rounded-lg border-l-2 border-warn-500 bg-warn-50/50 px-4 py-3.5">
              <p className="flex items-center gap-2 text-micro font-medium uppercase tracking-[0.08em] text-warn-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Diagnostic des signaux faibles
              </p>
              <p className="mt-2 text-small leading-relaxed text-ink-2">
                {currentRisk >= 0.7
                  ? `Risque élevé alimenté par une satisfaction basse (${onTen(satisfaction)}/10) et une rémunération de ${eur(talent.salary)} potentiellement en décalage après ${talent.experience_years} ans d'expérience.`
                  : currentRisk >= 0.4
                    ? `Signaux modérés de désengagement : les performances tiennent, mais l'adhésion aux objectifs collectifs s'effrite.`
                    : `Indicateurs au vert : collaborateur engagé, risque de départ faible.`}
              </p>
            </div>

            <div className="rounded-lg border-l-2 border-accent-600 bg-accent-50/50 px-4 py-3.5">
              <p className="flex items-center gap-2 text-micro font-medium uppercase tracking-[0.08em] text-accent-800">
                <Lightbulb className="h-3.5 w-3.5" />
                Guide d&apos;entretien 1-to-1 recommandé
              </p>
              <ul className="mt-2.5 space-y-2">
                <li className="flex gap-2.5 text-small leading-relaxed text-ink-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-4" aria-hidden />
                  Comment évalues-tu ton épanouissement sur tes projets actuels ?
                </li>
                <li className="flex gap-2.5 text-small leading-relaxed text-ink-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-4" aria-hidden />
                  Quelles perspectives d&apos;évolution te motiveraient le plus pour les 12 prochains mois ?
                </li>
              </ul>
            </div>
          </section>

          {/* Countermeasure simulator */}
          <section className="rounded-xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-small font-semibold text-ink">
                <Sliders className="h-3.5 w-3.5 text-ink-3" />
                Simulateur de Contre-Mesure
              </h4>
              {riskDrop > 0 && (
                <span className="badge border-ok-100 bg-ok-50 text-ok-700">
                  −{pct(riskDrop)} de risque
                </span>
              )}
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <label htmlFor="salary-adj" className="text-small text-ink-2">
                    Revalorisation salariale
                  </label>
                  <span className="figure text-small">
                    {salaryAdj > 0 ? `+${salaryAdj}%` : `${salaryAdj}%`}
                    <span className="ml-2 text-ink-4">
                      {eur((talent.salary ?? 45000) * (1 + salaryAdj / 100))}
                    </span>
                  </span>
                </div>
                <input
                  id="salary-adj"
                  type="range"
                  min={-5}
                  max={20}
                  step={1}
                  value={salaryAdj}
                  onChange={(e) => setSalaryAdj(Number(e.target.value))}
                />
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <label htmlFor="target-satisfaction" className="text-small text-ink-2">
                    Objectif de satisfaction
                  </label>
                  <span className="figure text-small">
                    {targetSatisfaction.toFixed(1)} <span className="text-ink-4">/ 10</span>
                  </span>
                </div>
                <input
                  id="target-satisfaction"
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={targetSatisfaction}
                  onChange={(e) => setTargetSatisfaction(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-small text-ink-2">Risque estimé après action</span>
              <span
                className={`figure text-title ${
                  simulatedRisk >= 0.7
                    ? "text-danger-600"
                    : simulatedRisk >= 0.4
                      ? "text-warn-600"
                      : "text-ok-600"
                }`}
              >
                {pct(simulatedRisk)}
              </span>
            </div>

            <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-4">
              Simulation indicative : ces coefficients illustrent une sensibilité, ils ne
              proviennent pas d&apos;un modèle réentraîné.
            </p>
          </section>
        </div>

        {/* ---------- Footer ---------- */}
        <div className="flex gap-2.5 border-t border-line bg-paper/70 px-6 py-4">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={handleCopyPlan}>
            {copied ? "Guide copié" : "Exporter pour le manager"}
          </Button>
        </div>
      </div>
    </div>
  );
}
