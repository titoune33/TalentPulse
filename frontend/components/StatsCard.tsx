import type { ReactNode } from "react";

export type Tone = "primary" | "green" | "amber" | "red" | "violet" | "slate" | "blue";

const iconBg: Record<Tone, string> = {
  primary: "bg-indigo-50 text-indigo-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
};

export function StatsCard({
  title,
  value,
  icon,
  tone = "primary",
  sub,
}: {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: Tone;
  sub?: ReactNode;
}) {
  return (
    <div className="card p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-lift">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className={`rounded-lg p-2.5 ${iconBg[tone]}`}>{icon}</div>
      </div>
      <div className="mt-2">
        <p className="font-mono text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}
