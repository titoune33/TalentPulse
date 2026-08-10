"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 300px at 20% 20%, rgba(99,102,241,0.55), transparent 60%), radial-gradient(500px 400px at 80% 80%, rgba(139,92,246,0.4), transparent 60%)",
          }}
        />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold text-white">TalentPulse</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="max-w-md text-3xl font-extrabold leading-tight text-white">
            Anticipez le départ de vos talents avant qu&apos;il ne soit trop tard.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            Notre modèle de machine learning analyse la performance, l&apos;engagement,
            la satisfaction et l&apos;expérience de chaque collaborateur pour détecter les
            risques de turnover dès qu&apos;ils apparaissent.
          </p>
          <div className="flex gap-8">
            {[
              { value: "92%", label: "de précision" },
              { value: "15 j", label: "d'avance sur le départ" },
              { value: "1 200+", label: "équipes RH" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} TalentPulse — SaaS RH intelligent
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-surface px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
