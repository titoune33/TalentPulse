"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink-3 shadow-card">
        <Lock className="h-5 w-5" aria-hidden />
      </span>

      <p className="eyebrow mt-6 justify-center">Permissions insuffisantes</p>
      <h1 className="mt-2 text-h3 font-semibold">Accès refusé</h1>
      <p className="mx-auto mt-2 max-w-[34ch] text-small text-ink-2">
        Votre rôle ne couvre pas cette ressource. Demandez à un administrateur de
        votre workspace de vous y donner accès.
      </p>

      <div className="mt-7 flex flex-col items-center gap-2">
        <Link href="/dashboard" className="btn-primary h-10 w-full px-4">
          Retour au tableau de bord
        </Link>
        <Link
          href="/auth/login"
          className="text-small font-medium text-accent-600 underline underline-offset-4 transition-colors hover:text-accent-700"
        >
          Changer de compte
        </Link>
      </div>
    </div>
  );
}
