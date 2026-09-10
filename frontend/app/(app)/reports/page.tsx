"use client";

import { useMemo, useState } from "react";
import { FileText, Download, Printer, AlertTriangle, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Badge, riskTone } from "@/components/Badge";
import { Spinner } from "@/components/Spinner";
import { useTalents } from "@/hooks/useTalents";
import { usePredictions } from "@/hooks/usePredictions";
import { dateFR, pct } from "@/lib/format";

export default function ReportsPage() {
  const { talents, stats, loading } = useTalents();
  const { predictions } = usePredictions();
  const [generated, setGenerated] = useState(false);
  const [sent, setSent] = useState(false);

  const report = useMemo(() => {
    if (!stats || talents.length === 0) return null;
    const atRisk = talents
      .filter((t) => t.turnover_risk >= 0.7)
      .sort((a, b) => b.turnover_risk - a.turnover_risk);
    const moderate = talents.filter(
      (t) => t.turnover_risk >= 0.4 && t.turnover_risk < 0.7
    );
    const avgRisk = talents.reduce((s, t) => s + t.turnover_risk, 0) / talents.length;
    return { atRisk, moderate, avgRisk };
  }, [talents, stats]);

  if (loading) return <Spinner />;

  if (!report) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Impossible de générer le rapport : aucune donnée disponible.
      </div>
    );
  }

  const buildLines = () => [
    "RAPPORT DE RISQUE DE TURNOVER - TalentPulse",
    `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
    "=".repeat(60),
    "",
    `Effectif total : ${stats?.total}`,
    `Risque moyen : ${pct(report.avgRisk)}`,
    `Talents à risque élevé (>= 70%) : ${report.atRisk.length}`,
    `Talents à risque modéré (40-70%) : ${report.moderate.length}`,
    `Prédictions disponibles : ${predictions.length}`,
    "",
    "TALENTS PRIORITAIRES",
    "-".repeat(60),
    ...report.atRisk.map(
      (t, i) =>
        `${i + 1}. ${t.first_name} ${t.last_name} (${t.position ?? "—"}, ${t.department ?? "—"}) - risque ${pct(t.turnover_risk)}`
    ),
    "",
    "RECOMMANDATIONS",
    "-".repeat(60),
    ...report.atRisk.map(
      (t, i) =>
        `${i + 1}. ${t.first_name} ${t.last_name} : ${
          t.turnover_risk >= 0.8
            ? "entretien individuel + revue de rémunération"
            : "entretien de carrière + reconnaissance"
        }`
    ),
  ];

  const saveBlob = (content: string, mime: string, extension: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-turnover-${new Date().toISOString().slice(0, 10)}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSummary = () => saveBlob(buildLines().join("\n"), "text/plain", "txt");

  /** Full register as CSV — one row per collaborator. */
  const downloadCsv = () => {
    const header = [
      "prenom",
      "nom",
      "email",
      "poste",
      "departement",
      "anciennete_annees",
      "salaire_annuel_eur",
      "performance_0_1",
      "engagement_0_1",
      "satisfaction_0_1",
      "risque_turnover_0_1",
      "niveau_risque",
    ];
    const rows = [...talents]
      .sort((a, b) => b.turnover_risk - a.turnover_risk)
      .map((t) => [
        t.first_name,
        t.last_name,
        t.email,
        t.position ?? "",
        t.department ?? "",
        String(t.experience_years),
        t.salary != null ? String(t.salary) : "",
        t.performance_score.toFixed(3),
        t.engagement_score.toFixed(3),
        t.satisfaction_score.toFixed(3),
        t.turnover_risk.toFixed(4),
        riskTone(t.turnover_risk),
      ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    // A BOM keeps Excel from mangling the French accents.
    saveBlob(`\uFEFF${csv}`, "text/csv", "csv");
  };

  /** Opens the user's mail client with the executive summary pre-filled. */
  const sendToDirection = () => {
    const subject = encodeURIComponent(
      `Rapport turnover TalentPulse — ${report.atRisk.length} talent(s) à risque élevé`
    );
    const body = encodeURIComponent(buildLines().join("\n"));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Rapports</h2>
          <p className="mt-1 text-sm text-slate-500">
            Générez un rapport exécutif du risque de turnover de vos équipes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </Button>
          <Button onClick={downloadSummary}>
            <Download className="h-4 w-4" />
            Télécharger (.txt)
          </Button>
        </div>
      </div>

      {!generated ? (
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <div className="rounded-2xl bg-indigo-50 p-4">
            <FileText className="h-10 w-10 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Rapport de risque de turnover
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Synthèse de {stats?.total} collaborateurs, {predictions.length} prédictions et {report.atRisk.length} talents prioritaires.
            </p>
          </div>
          <Button onClick={() => setGenerated(true)}>
            <FileText className="h-4 w-4" />
            Générer le rapport
          </Button>
        </div>
      ) : (
        <div className="card space-y-6 p-6 sm:p-8" id="print-area">
          {/* Header premium */}
          <div className="border-b border-slate-200 pb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              TalentPulse · Rapport exécutif
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              Rapport de risque de turnover
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Généré le {new Date().toLocaleDateString("fr-FR")} ·{" "}
              {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* KPIs premium */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Effectif", value: String(stats?.total ?? 0), icon: <FileText className="h-4 w-4 text-slate-400" /> },
              { label: "Risque moyen", value: pct(report.avgRisk), icon: <AlertTriangle className="h-4 w-4 text-slate-400" /> },
              { label: "À risque élevé", value: String(report.atRisk.length), icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
              { label: "Prédictions", value: String(predictions.length), icon: <FileText className="h-4 w-4 text-slate-400" /> },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="mb-1 flex justify-center">{kpi.icon}</div>
                <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Priority talents */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Talents prioritaires ({report.atRisk.length})
              </h4>
              <Button variant="ghost" size="sm" onClick={downloadCsv}>
                <Download className="h-3.5 w-3.5" />
                Exporter tout en CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-4 font-semibold">#</th>
                    <th className="py-2 pr-4 font-semibold">Collaborateur</th>
                    <th className="py-2 pr-4 font-semibold">Poste</th>
                    <th className="py-2 pr-4 font-semibold">Département</th>
                    <th className="py-2 pr-4 font-semibold">Embauche</th>
                    <th className="py-2 font-semibold">Risque</th>
                  </tr>
                </thead>
                <tbody>
                  {report.atRisk.map((t, i) => (
                    <tr key={t.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 pr-4 font-bold text-slate-400">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-semibold text-slate-800">
                        {t.first_name} {t.last_name}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{t.position ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{t.department ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{dateFR(t.hire_date)}</td>
                      <td className="py-2.5">
                        <Badge tone={riskTone(t.turnover_risk)}>{pct(t.turnover_risk)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-900">Synthèse</h4>
            <div className="rounded-xl bg-indigo-50 p-4 text-sm leading-relaxed text-slate-700">
              {report.atRisk.length > 0 ? (
                <>
                  {report.atRisk.length} talent{report.atRisk.length > 1 ? "s" : ""} présente
                  {report.atRisk.length > 1 ? "nt" : ""} un risque de départ supérieur à 70%.
                  Le risque moyen de l'équipe est de {pct(report.avgRisk)}. Nous recommandons
                  un entretien individuel sous 15 jours pour{" "}
                  <strong>
                    {report.atRisk[0].first_name} {report.atRisk[0].last_name}
                  </strong>{" "}
                  ({pct(report.atRisk[0].turnover_risk)} de risque), en priorité absolue.
                </>
              ) : (
                "Aucun talent ne présente un risque critique. Poursuivez les pratiques actuelles de fidélisation."
              )}
            </div>
          </div>

          {/* Share with the executive committee */}
          <div className="border-t border-slate-200 pt-5">
            <Button variant="secondary" onClick={sendToDirection}>
              <Send className="h-4 w-4" />
              Envoyer à la direction
            </Button>
            {sent ? (
              <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Votre logiciel de messagerie s&apos;est ouvert avec le rapport pré-rempli.
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Ouvre votre messagerie avec la synthèse prête à envoyer. Pour joindre une pièce,
                téléchargez d&apos;abord le rapport.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
