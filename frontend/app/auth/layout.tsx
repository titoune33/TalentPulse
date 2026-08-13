"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-white p-12 lg:flex">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[250px] bg-violet-200/20 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">TalentPulse</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="max-w-md text-3xl font-extrabold leading-tight text-slate-900">
            Anticipez le départ de vos talents avant qu'il ne soit trop tard.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-500">
            Notre modèle de machine learning analyse la performance, l'engagement,
            la satisfaction et l'expérience de chaque collaborateur pour détecter les
            risques de turnover dès qu'ils apparaissent.
          </p>
          <div className="flex gap-8">
            {[
              { value: "92%", label: "de précision" },
              { value: "15 j", label: "d'avance sur le départ" },
              { value: "1 200+", label: "équipes RH" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-indigo-600">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-400">
          © {new Date().getFullYear()} TalentPulse — SaaS RH intelligent
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
