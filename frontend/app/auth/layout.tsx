"use client";

import Link from "next/link";

/**
 * Split institutional shell for every authentication screen.
 *
 * Left rail (lg and up): graphite band, faint paper grid, wordmark and three
 * verifiable product facts. Right rail: warm paper, one centred column of
 * ~400px where all the attention lives.
 */

const FACTS = [
  {
    value: "5",
    label: "Signaux RH",
    detail: "Performance, engagement, satisfaction, ancienneté, rémunération.",
  },
  {
    value: "13",
    label: "Semaines d'historique",
    detail: "Tendance de risque par équipe, conservée pour l'audit.",
  },
  {
    value: "≥ 70 %",
    label: "Seuil d'alerte",
    detail: "Le collaborateur remonte en tête du tableau de bord.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ---- Left rail: institutional statement (desktop only) ---- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-ink px-12 py-14 lg:flex xl:px-16">
        <div className="bg-grid absolute inset-0 opacity-[0.35]" aria-hidden />

        <Link
          href="/"
          className="relative inline-flex w-fit items-center gap-2.5 rounded"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                d="M3 13h3.2l2.1-6.2 3.4 11.4 2.4-7.1 1.6 3.9H21"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
            Talent<span className="text-white/55">Pulse</span>
          </span>
        </Link>

        <div className="relative max-w-[30rem]">
          <p className="font-mono text-micro uppercase text-white/40">
            Pilotage du risque
          </p>
          <h2 className="mt-5 text-h2 font-semibold text-white">
            Savez qui va partir{" "}
            <span className="font-display font-normal italic text-white/70">
              avant qu&apos;il ne démissionne.
            </span>
          </h2>
          <p className="mt-4 max-w-[26rem] text-base text-white/60">
            Un score de risque par collaborateur, calculé sur cinq signaux RH, et le
            plan d&apos;action qui va avec.
          </p>

          <dl className="mt-12 border-t border-white/10">
            {FACTS.map((fact) => (
              <div key={fact.label} className="border-b border-white/10 py-4">
                <dt className="flex items-baseline gap-3">
                  <span className="font-mono text-title text-white">{fact.value}</span>
                  <span className="font-mono text-micro uppercase text-white/45">
                    {fact.label}
                  </span>
                </dt>
                <dd className="mt-1.5 text-small text-white/50">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-micro tracking-normal text-white/35">
          © {new Date().getFullYear()} TalentPulse — auto-hébergeable sur votre
          infrastructure
        </p>
      </aside>

      {/* ---- Right rail: the form ---- */}
      <div className="flex items-center justify-center bg-paper px-5 py-14 sm:px-8">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
