import type { ReactNode } from "react";

type Tone = "primary" | "green" | "amber" | "red" | "violet";

const iconBg: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
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
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-0.5 truncate text-2xl font-extrabold text-slate-900">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
