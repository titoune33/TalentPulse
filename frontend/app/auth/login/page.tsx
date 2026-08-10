"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Connexion impossible"));
    } finally {
      setLoading(false);
    }
  };

  const demo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      await demoLogin();
      router.replace("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Connexion démo impossible"));
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile logo */}
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Zap className="h-5 w-5" />
        </div>
        <span className="text-lg font-extrabold text-slate-900">TalentPulse</span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900">
        Connexion à votre espace
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Accédez à votre tableau de bord RH.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="vous@entreprise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Mot de passe">
          <Input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={loading}>
          <LogIn className="h-4 w-4" />
          Se connecter
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">ou</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={demo}
        loading={demoLoading}
      >
        <Sparkles className="h-4 w-4 text-primary-600" />
        Explorer la démo
      </Button>

      <p className="mt-4 text-center text-xs text-slate-400">
        Compte démo : <code className="rounded bg-slate-100 px-1.5 py-0.5">demo@talentpulse.app</code> /{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">demo1234</code>
      </p>

      <p className="mt-8 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
