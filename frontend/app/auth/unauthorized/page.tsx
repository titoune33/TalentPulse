"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Lock className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Accès refusé</h1>
        <p className="mt-2 text-slate-600">
          Vous n\’avez pas les permissions nécessaires pour accéder à cette ressource.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
