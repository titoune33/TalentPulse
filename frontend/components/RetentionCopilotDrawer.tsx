"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Briefcase,
  Smile,
  Copy,
  Check,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import { Button } from "./Button";
import { pct, eur } from "@/lib/format";
import type { Talent } from "@/lib/types";

interface RetentionCopilotDrawerProps {
  talent: Talent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RetentionCopilotDrawer({
  talent,
  isOpen,
  onClose,
}: RetentionCopilotDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [salaryAdj, setSalaryAdj] = useState(0); // in percent (-5 to +20%)
  // The API stores satisfaction on a 0-1 scale; managers think in /10, so the
  // slider works in /10 and is normalised before any maths.
  const [targetSatisfaction, setTargetSatisfaction] = useState(5);

  useEffect(() => {
    if (talent) {
      setSalaryAdj(0);
      setTargetSatisfaction(Math.round((talent.satisfaction_score ?? 0) * 20) / 2);
    }
  }, [talent]);

  if (!isOpen || !talent) return null;

  const satisfaction = talent.satisfaction_score ?? 0;
  const engagement = talent.engagement_score ?? 0;

  // Simulated risk after the manager's actions. Coefficients are illustrative
  // what-if sensitivities, not a retrained model output.
  const currentRisk = talent.turnover_risk;
  const simulatedRisk = Math.min(
    0.98,
    Math.max(
      0.05,
      currentRisk -
        salaryAdj * 0.012 -
        (targetSatisfaction / 10 - satisfaction) * 0.45
    )
  );

  const riskDrop = Math.max(0, currentRisk - simulatedRisk);

  const fullName = `${talent.first_name} ${talent.last_name}`;
  const initials = `${talent.first_name[0] ?? ""}${talent.last_name[0] ?? ""}`.toUpperCase();

  const handleCopyPlan = () => {
    const text = `Plan de rétention — ${fullName} (${talent.position ?? "Poste non défini"}, ${talent.department ?? "Département non défini"})
Risque de départ estimé : ${pct(currentRisk)} (score RandomForest)
Facteurs clés : satisfaction ${(satisfaction * 10).toFixed(1)}/10 · engagement ${(engagement * 10).toFixed(1)}/10 · salaire ${eur(talent.salary)} · ancienneté ${talent.experience_years} ans
Questions recommandées pour l'entretien 1-to-1 :
1. Comment perçois-tu l'évolution de tes responsabilités pour les 6 prochains mois ?
2. Quels sont les irritants majeurs dans tes projets actuels ?
Simulation de contre-mesure : revalorisation ${salaryAdj > 0 ? `+${salaryAdj}%` : `${salaryAdj}%`} et objectif de satisfaction ${targetSatisfaction}/10 → risque estimé ${pct(simulatedRisk)}.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Plan de rétention"
        className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-full border-l border-slate-200 overflow-y-auto animate-slideInRight"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 font-bold text-white shadow-glow">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white leading-snug">{fullName}</h3>
                <span className="rounded-md bg-primary-950 border border-primary-500/40 px-2 py-0.5 text-[10px] font-semibold text-primary-300">
                  Plan de rétention
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {talent.position} · {talent.department}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Risk Score Summary Banner */}
          <div
            className={`rounded-xl border p-5 ${
              currentRisk >= 0.7
                ? "border-rose-200 bg-rose-50/70"
                : currentRisk >= 0.4
                ? "border-amber-200 bg-amber-50/70"
                : "border-emerald-200 bg-emerald-50/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Niveau de risque de départ
                </span>
                <p className="font-mono text-3xl font-extrabold text-slate-900 mt-0.5">
                  {pct(currentRisk)}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    currentRisk >= 0.7
                      ? "bg-rose-100 text-rose-800"
                      : currentRisk >= 0.4
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {currentRisk >= 0.7
                    ? "Risque Critique"
                    : currentRisk >= 0.4
                    ? "Vigilance Requise"
                    : "Situation Stable"}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Détecté par RandomForest
                </p>
              </div>
            </div>

            {/* Micro indicators */}
            <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-500">Satisfaction</span>
                <p className="font-mono font-bold text-slate-800">
                  {(satisfaction * 10).toFixed(1)} / 10
                </p>
              </div>
              <div>
                <span className="text-slate-500">Engagement</span>
                <p className="font-mono font-bold text-slate-800">
                  {(engagement * 10).toFixed(1)} / 10
                </p>
              </div>
              <div>
                <span className="text-slate-500">Ancienneté</span>
                <p className="font-mono font-bold text-slate-800">
                  {talent.experience_years} ans
                </p>
              </div>
            </div>
          </div>

          {/* Retention recommendations */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Recommandations stratégiques
                </h4>
              </div>
              <button
                onClick={handleCopyPlan}
                className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>

            {/* Diagnostic */}
            <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Diagnostic des signaux faibles
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentRisk >= 0.7
                  ? `Risque élevé alimenté par un score de satisfaction bas (${(satisfaction * 10).toFixed(1)}/10) et un niveau de rémunération (${eur(talent.salary)}) potentiellement en décalage avec le marché pour ${talent.experience_years} ans d'expérience.`
                  : currentRisk >= 0.4
                  ? `Signaux modérés de désengagement. Le collaborateur maintient de bonnes performances mais montre une baisse progressive d'adhésion aux objectifs collectifs.`
                  : `Indicateurs au vert. Collaborateur engagé et performant avec un risque de départ minime.`}
              </p>
            </div>

            {/* Questions to ask */}
            <div className="rounded-lg bg-indigo-50/50 p-3.5 border border-indigo-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 mb-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-indigo-600" />
                Guide d'entretien 1-to-1 recommandé
              </div>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li>
                  « Comment évalues-tu ton niveau d'épanouissement sur tes projets actuels ? »
                </li>
                <li>
                  « Quelles perspectives d'évolution ou de nouvelles responsabilités te motiveraient le plus pour les 12 prochains mois ? »
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Countermeasure Simulator */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  Simulateur de Contre-Mesure
                </h4>
              </div>
              {riskDrop > 0 && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                  -{pct(riskDrop)} de risque
                </span>
              )}
            </div>

            {/* Slider 1: Salary adjustment */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Revalorisation salariale</span>
                <span className="font-mono font-bold text-primary-600">
                  {salaryAdj > 0 ? `+${salaryAdj}%` : `${salaryAdj}%`} ({eur((talent.salary ?? 45000) * (1 + salaryAdj / 100))})
                </span>
              </div>
              <input
                type="range"
                min={-5}
                max={20}
                step={1}
                value={salaryAdj}
                onChange={(e) => setSalaryAdj(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Slider 2: Satisfaction boost */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Objectif satisfaction</span>
                <span className="font-mono font-bold text-primary-600">
                  {targetSatisfaction.toFixed(1)} / 10
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={targetSatisfaction}
                onChange={(e) => setTargetSatisfaction(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Simulated Risk Meter */}
            <div className="rounded-lg bg-white p-3.5 border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600">Risque estimé après action :</span>
              <span
                className={`font-mono font-bold text-base ${
                  simulatedRisk >= 0.7
                    ? "text-rose-600"
                    : simulatedRisk >= 0.4
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {pct(simulatedRisk)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={handleCopyPlan}>
            {copied ? "Guide copié !" : "Exporter pour le manager"}
          </Button>
        </div>
      </div>
    </div>
  );
}
