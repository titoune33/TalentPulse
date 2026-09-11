import type { ReactNode } from "react";

type Tone = "green" | "amber" | "red" | "blue" | "slate" | "violet";

const tones: Record<Tone, string> = {
  green: "badge-risk-low",
  amber: "badge-risk-medium",
  red: "badge-risk-high",
  blue: "badge border-accent-100 bg-accent-50 text-accent-700",
  slate: "badge-neutral",
  violet: "badge border-line bg-sunken text-ink-2",
};

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <span className={tones[tone]}>{children}</span>;
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

/** Solid swatch used next to a risk figure in dense tables. */
export function RiskDot({ score }: { score: number }) {
  const color =
    score >= 0.7 ? "bg-danger-600" : score >= 0.4 ? "bg-warn-500" : "bg-ok-600";
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />;
}
