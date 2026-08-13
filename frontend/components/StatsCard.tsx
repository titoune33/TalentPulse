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
    <div className="card flex items-start gap-4 p-5">
      <div className={`rounded-xl p-3 ${iconBg[tone]}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-0.5 truncate text-2xl font-extrabold text-slate-900">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
