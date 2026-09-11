import type { ReactNode } from "react";

export type Tone = "primary" | "green" | "amber" | "red" | "violet" | "slate" | "blue";

/** A semantic tone only earns a coloured mark; the card itself stays neutral. */
const marks: Record<Tone, string> = {
  primary: "bg-accent-600",
  green: "bg-ok-600",
  amber: "bg-warn-500",
  red: "bg-danger-600",
  violet: "bg-ink-3",
  slate: "bg-ink-4",
  blue: "bg-accent-600",
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
    <div className="card card-hover flex flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${marks[tone]}`} aria-hidden />
          <p className="text-micro font-medium uppercase tracking-[0.09em] text-ink-3">
            {title}
          </p>
        </div>
        <span className="text-ink-4">{icon}</span>
      </div>

      <div className="mt-5">
        <p className="figure text-[2rem] leading-none">{value}</p>
        {sub && <p className="mt-2 text-small text-ink-3">{sub}</p>}
      </div>
    </div>
  );
}
