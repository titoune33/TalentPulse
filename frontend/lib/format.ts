/** Format a 0-1 score as a percentage string */
export function pct(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100 * Math.pow(10, digits)) / Math.pow(10, digits)}%`;
}

/** Format a salary in EUR */
export function eur(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format an ISO date to a French short date */
export function dateFR(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Format a datetime to French short datetime */
export function dateTimeFR(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function riskLabel(score: number): { label: string; color: string } {
  if (score >= 0.7) return { label: "Risque élevé", color: "red" };
  if (score >= 0.4) return { label: "Risque modéré", color: "amber" };
  return { label: "Risque faible", color: "green" };
}
