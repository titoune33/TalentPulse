"use client";

import { useMemo, useState } from "react";
import { FileText, Download, Printer, Send, CheckCircle2 } from "lucide-react";
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
      <div className="rounded-lg border border-danger-100 bg-danger-50 p-6 text-small text-danger-700">
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
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Pilotage du risque</p>
          <h2 className="mt-2 text-h2 font-semibold">Rapports</h2>
          <p className="mt-1.5 max-w-2xl text-base text-ink-2">
            Produisez la note de direction du risque de turnover et transmettez-la au Comex.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </Button>
          <Button onClick={downloadSummary}>
            <Download className="h-4 w-4" />
            Télécharger (.txt)
          </Button>
        </div>
      </header>

      {!generated ? (
        <div className="card flex flex-col items-start gap-5 p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
            <h3 className="text-title font-semibold">Rapport de risque de turnover</h3>
          </div>
          <p className="max-w-xl text-base text-ink-2">
            Synthèse de {stats?.total} collaborateurs, {predictions.length} prédictions et{" "}
            {report.atRisk.length} talents prioritaires. Le document est daté, exportable et
            imprimable tel quel.
          </p>
          <Button onClick={() => setGenerated(true)}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            Générer le rapport
          </Button>
        </div>
      ) : (
        <article className="card space-y-8 p-6 sm:p-8" id="print-area">
          {/* En-tête typographique : la page doit se lire comme une note, pas comme un écran. */}
          <header className="border-b border-line pb-6">
            <p className="font-mono text-micro font-medium uppercase text-accent-700">
              TalentPulse · Rapport exécutif
            </p>
            <h3 className="mt-3 text-h3 font-semibold">Rapport de risque de turnover</h3>
            <p className="mt-2 font-mono text-small tracking-[0.01em] text-ink-3">
              Généré le {new Date().toLocaleDateString("fr-FR")} ·{" "}
              {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </header>

          {/* KPI alignés en colonnes, sans ornement. */}
          <div className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
            {[
              { label: "Effectif", value: String(stats?.total ?? 0) },
              { label: "Risque moyen", value: pct(report.avgRisk) },
              { label: "À risque élevé", value: String(report.atRisk.length) },
              { label: "Prédictions", value: String(predictions.length) },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="border-line px-1 py-5 sm:border-r sm:px-5 sm:last:border-r-0"
              >
                <p className="font-mono text-micro font-medium uppercase text-ink-3">
                  {kpi.label}
                </p>
                <p className="figure mt-2 text-h2">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Talents prioritaires — tableau dense à filets horizontaux. */}
          <section>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h4 className="text-title font-semibold">
                Talents prioritaires ({report.atRisk.length})
              </h4>
              <Button variant="ghost" size="sm" onClick={downloadCsv}>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Exporter tout en CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-line-strong">
                    <th className="py-2.5 pr-4 font-mono text-micro font-medium uppercase text-ink-3">
                      #
                    </th>
                    <th className="py-2.5 pr-4 font-mono text-micro font-medium uppercase text-ink-3">
                      Collaborateur
                    </th>
                    <th className="py-2.5 pr-4 font-mono text-micro font-medium uppercase text-ink-3">
                      Poste
                    </th>
                    <th className="py-2.5 pr-4 font-mono text-micro font-medium uppercase text-ink-3">
                      Département
                    </th>
                    <th className="py-2.5 pr-4 font-mono text-micro font-medium uppercase text-ink-3">
                      Embauche
                    </th>
                    <th className="py-2.5 font-mono text-micro font-medium uppercase text-ink-3">
                      Risque
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.atRisk.map((t, i) => (
                    <tr key={t.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-ink-4">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium text-ink">
                        {t.first_name} {t.last_name}
                      </td>
                      <td className="py-2.5 pr-4 text-ink-2">{t.position ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-ink-2">{t.department ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-ink-2">{dateFR(t.hire_date)}</td>
                      <td className="py-2.5">
                        <Badge tone={riskTone(t.turnover_risk)}>{pct(t.turnover_risk)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Synthèse — encart sobre, filet latéral cobalt. */}
          <section>
            <h4 className="mb-3 text-title font-semibold">Synthèse</h4>
            <div className="border-l-2 border-accent-600 bg-sunken px-5 py-4">
              <p className="text-base leading-relaxed text-ink-2">
                {report.atRisk.length > 0 ? (
                  <>
                    {report.atRisk.length} talent{report.atRisk.length > 1 ? "s" : ""} présente
                    {report.atRisk.length > 1 ? "nt" : ""} un risque de départ supérieur à 70%.
                    Le risque moyen de l&apos;équipe est de {pct(report.avgRisk)}. Nous recommandons
                    un entretien individuel sous 15 jours pour{" "}
                    <strong className="font-semibold text-ink">
                      {report.atRisk[0].first_name} {report.atRisk[0].last_name}
                    </strong>{" "}
                    ({pct(report.atRisk[0].turnover_risk)} de risque), en priorité absolue.
                  </>
                ) : (
                  "Aucun talent ne présente un risque critique. Poursuivez les pratiques actuelles de fidélisation."
                )}
              </p>
            </div>
          </section>

          {/* Diffusion au comité de direction */}
          <footer className="border-t border-line pt-6">
            <Button variant="secondary" onClick={sendToDirection}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Envoyer à la direction
            </Button>
            {sent ? (
              <p className="mt-2.5 flex items-center gap-1.5 text-small text-ok-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Votre logiciel de messagerie s&apos;est ouvert avec le rapport pré-rempli.
              </p>
            ) : (
              <p className="mt-2.5 max-w-2xl text-small text-ink-3">
                Ouvre votre messagerie avec la synthèse prête à envoyer. Pour joindre une pièce,
                téléchargez d&apos;abord le rapport.
              </p>
            )}
          </footer>
        </article>
      )}
    </div>
  );
}
