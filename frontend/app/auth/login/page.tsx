"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LogIn } from "lucide-react";
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
      {/* Wordmark — the left rail carries it from lg up. */}
      <Link
        href="/"
        className="mb-10 inline-flex w-fit items-center gap-2.5 rounded lg:hidden"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white">
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
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Talent<span className="text-ink-3">Pulse</span>
        </span>
      </Link>

      <header className="border-b border-line pb-5">
        <p className="eyebrow">Accès sécurisé</p>
        <h1 className="mt-2 text-h3 font-semibold">Connexion à votre espace</h1>
        <p className="mt-1.5 text-small text-ink-2">
          Accédez à votre tableau de bord RH.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-md border border-danger-100 bg-danger-50 px-3.5 py-3 text-small text-danger-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
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

      {/* Compte démo — levier de conversion, présenté comme un encart. */}
      <div className="mt-8 rounded-xl border border-line bg-sunken px-4 py-4">
        <p className="font-mono text-micro uppercase text-ink-3">
          Compte de démonstration
        </p>
        <dl className="mt-3 space-y-1.5 font-mono text-small">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-3">Identifiant</dt>
            <dd className="truncate text-ink">demo@talentpulse.app</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-3">Mot de passe</dt>
            <dd className="text-ink">demo1234</dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          className="mt-3.5 w-full"
          onClick={demo}
          loading={demoLoading}
        >
          Explorer la démo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-6 text-center text-small text-ink-2">
        Pas encore de compte ?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-accent-600 underline underline-offset-4 transition-colors hover:text-accent-700"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
