import type { ReactNode } from "react";

type Tone = "green" | "amber" | "red" | "blue" | "slate" | "violet";

const tones: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span className={`badge ring-1 ring-inset ${tones[tone]}`}>{children}</span>
  );
}

export function riskTone(score: number): Tone {
  if (score >= 0.7) return "red";
  if (score >= 0.4) return "amber";
  return "green";
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "active":
      return "green";
    case "at_risk":
      return "red";
    case "inactive":
      return "slate";
    case "turnover":
      return "violet";
    default:
      return "slate";
  }
}

export const statusLabel: Record<string, string> = {
  active: "Actif",
  at_risk: "À risque",
  inactive: "Inactif",
  turnover: "Départ",
};
