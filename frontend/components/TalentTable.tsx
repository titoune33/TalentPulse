"use client";

import { Pencil, Trash2, Sparkles, SearchX } from "lucide-react";
import type { Talent } from "@/lib/types";
import { Badge, riskTone, statusLabel, statusTone } from "./Badge";
import { eur, pct } from "@/lib/format";

export function TalentTable({
  talents,
  loading,
  onEdit,
  onDelete,
  onPredict,
}: {
  talents: Talent[];
  loading?: boolean;
  onEdit?: (t: Talent) => void;
  onDelete?: (t: Talent) => void;
  onPredict?: (t: Talent) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (talents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-12 text-center">
        <SearchX className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">
          Aucun talent trouvé
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Collaborateur</th>
            <th className="px-4 py-3 font-semibold">Poste</th>
            <th className="px-4 py-3 font-semibold">Département</th>
            <th className="px-4 py-3 font-semibold">Salaire</th>
            <th className="px-4 py-3 font-semibold">Perf.</th>
            <th className="px-4 py-3 font-semibold">Risque</th>
            <th className="px-4 py-3 font-semibold">Statut</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {talents.map((t) => (
            <tr
              key={t.id}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {t.first_name[0]}
                    {t.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {t.first_name} {t.last_name}
                    </p>
                    <p className="truncate text-xs text-slate-400">{t.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {t.position ?? "—"}
              </td>
              <td className="px-4 py-3">
                <Badge tone="slate">{t.department ?? "Non défini"}</Badge>
              </td>
              <td className="px-4 py-3 text-slate-600">{eur(t.salary)}</td>
              <td className="px-4 py-3 text-slate-600">
                {pct(t.performance_score)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        t.turnover_risk >= 0.7
                          ? "bg-red-500"
                          : t.turnover_risk >= 0.4
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, t.turnover_risk * 100)}%` }}
                    />
                  </div>
                  <Badge tone={riskTone(t.turnover_risk)}>
                    {pct(t.turnover_risk)}
                  </Badge>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(t.status)}>
                  {statusLabel[t.status] ?? t.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  {onPredict && (
                    <button
                      onClick={() => onPredict(t)}
                      title="Lancer une prédiction"
                      className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(t)}
                      title="Modifier"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(t)}
                      title="Supprimer"
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
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
