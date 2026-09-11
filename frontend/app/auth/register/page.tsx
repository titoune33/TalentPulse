"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!email.includes("@")) {
      setError("Veuillez saisir un email valide.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ name, email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Inscription impossible"));
    } finally {
      setLoading(false);
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
        <p className="eyebrow">Nouveau workspace</p>
        <h1 className="mt-2 text-h3 font-semibold">Créer votre compte</h1>
        <p className="mt-1.5 text-small text-ink-2">
          Vous devenez propriétaire du workspace et accédez immédiatement au tableau
          de bord.
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
        <Field label="Nom complet">
          <Input
            required
            autoComplete="name"
            placeholder="Marie Dupont"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email professionnel">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="vous@entreprise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Mot de passe" hint="8 caractères minimum">
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={loading}>
          <UserPlus className="h-4 w-4" />
          Créer mon compte
        </Button>
      </form>

      <p className="mt-8 text-center text-small text-ink-2">
        Déjà inscrit ?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-accent-600 underline underline-offset-4 transition-colors hover:text-accent-700"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
