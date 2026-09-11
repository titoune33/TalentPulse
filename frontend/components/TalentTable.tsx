"use client";

import { Pencil, Trash2, Sparkles, SearchX, Calendar } from "lucide-react";
import type { Talent } from "@/lib/types";
import { Badge, statusLabel, statusTone } from "./Badge";
import { eur, pct } from "@/lib/format";

/** Risk reads as a figure plus a hairline gauge — never as a loud pill. */
function RiskFigure({ score }: { score: number }) {
  const bar =
    score >= 0.7 ? "bg-danger-600" : score >= 0.4 ? "bg-warn-500" : "bg-ok-600";
  return (
    <div className="flex items-center justify-end gap-2.5">
      <span className="figure w-[3ch] text-right text-small">{pct(score)}</span>
      <span className="h-[3px] w-12 shrink-0 overflow-hidden rounded-full bg-sunken">
        <span
          className={`block h-full rounded-full ${bar}`}
          style={{ width: `${Math.min(100, score * 100)}%` }}
        />
      </span>
    </div>
  );
}

export function TalentTable({
  talents,
  loading,
  onEdit,
  onDelete,
  onPredict,
  onOpenCopilot,
}: {
  talents: Talent[];
  loading?: boolean;
  onEdit?: (t: Talent) => void;
  onDelete?: (t: Talent) => void;
  onPredict?: (t: Talent) => void;
  onOpenCopilot?: (t: Talent) => void;
}) {
  if (loading) {
    return (
      <div className="divide-y divide-line">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 animate-pulse bg-sunken/60" />
        ))}
      </div>
    );
  }

  if (talents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 border border-dashed border-line-strong bg-surface py-14 text-center">
        <SearchX className="h-6 w-6 text-ink-4" />
        <p className="text-small font-medium text-ink-3">Aucun talent trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[940px] text-left">
        <thead>
          <tr className="border-b border-line bg-sunken/40">
            <th className="px-4 py-2.5 font-mono text-micro font-medium uppercase text-ink-4">
              Collaborateur
            </th>
            <th className="px-4 py-2.5 font-mono text-micro font-medium uppercase text-ink-4">
              Poste
            </th>
            <th className="px-4 py-2.5 font-mono text-micro font-medium uppercase text-ink-4">
              Département
            </th>
            <th className="px-4 py-2.5 text-right font-mono text-micro font-medium uppercase text-ink-4">
              Salaire
            </th>
            <th className="px-4 py-2.5 text-right font-mono text-micro font-medium uppercase text-ink-4">
              Exp.
            </th>
            <th className="px-4 py-2.5 font-mono text-micro font-medium uppercase text-ink-4">
              Compétences
            </th>
            <th className="px-4 py-2.5 text-right font-mono text-micro font-medium uppercase text-ink-4">
              Risque
            </th>
            <th className="px-4 py-2.5 font-mono text-micro font-medium uppercase text-ink-4">
              Statut
            </th>
            <th className="px-4 py-2.5 text-right font-mono text-micro font-medium uppercase text-ink-4">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {talents.map((t) => (
            <tr
              key={t.id}
              className="border-b border-line transition-colors last:border-b-0 hover:bg-sunken/60"
            >
              <td className="px-4 py-2.5 align-middle">
                <div className="min-w-0">
                  <p className="truncate text-small font-medium text-ink">
                    {t.first_name} {t.last_name}
                  </p>
                  <p className="truncate font-mono text-micro tracking-normal text-ink-4">
                    {t.email}
                  </p>
                </div>
              </td>
              <td className="px-4 py-2.5 align-middle text-small text-ink-2">
                {t.position ?? "—"}
              </td>
              <td className="px-4 py-2.5 align-middle">
                <Badge tone="slate">{t.department ?? "Non défini"}</Badge>
              </td>
              <td className="figure px-4 py-2.5 text-right align-middle text-small text-ink-2">
                {eur(t.salary)}
              </td>
              <td className="figure px-4 py-2.5 text-right align-middle text-small text-ink-2">
                {t.experience_years} an{t.experience_years > 1 ? "s" : ""}
              </td>
              <td className="px-4 py-2.5 align-middle">
                <div className="flex flex-wrap items-center gap-1">
                  {t.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-line bg-sunken px-1.5 py-0.5 font-mono text-micro tracking-normal text-ink-2"
                    >
                      {skill}
                    </span>
                  ))}
                  {t.skills.length > 2 && (
                    <span className="font-mono text-micro tracking-normal text-ink-4">
                      +{t.skills.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2.5 align-middle">
                <RiskFigure score={t.turnover_risk} />
              </td>
              <td className="px-4 py-2.5 align-middle">
                <Badge tone={statusTone(t.status)}>
                  {statusLabel[t.status] ?? t.status}
                </Badge>
              </td>
              <td className="px-4 py-2.5 align-middle">
                <div className="flex justify-end gap-0.5">
                  {onOpenCopilot && (
                    <button
                      onClick={() => onOpenCopilot(t)}
                      title="Ouvrir le Copilot de Rétention IA"
                      aria-label="Ouvrir le Copilot de Rétention IA"
                      className="rounded p-1.5 text-ink-3 transition-colors hover:bg-sunken hover:text-accent-600"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  )}
                  {onPredict && (
                    <button
                      onClick={() => onPredict(t)}
                      title="Lancer une prédiction"
                      aria-label="Lancer une prédiction"
                      className="rounded p-1.5 text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(t)}
                      title="Modifier"
                      aria-label="Modifier"
                      className="rounded p-1.5 text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(t)}
                      title="Supprimer"
                      aria-label="Supprimer"
                      className="rounded p-1.5 text-ink-3 transition-colors hover:bg-sunken hover:text-danger-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
