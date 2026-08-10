"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, UserPlus } from "lucide-react";
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
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Zap className="h-5 w-5" />
        </div>
        <span className="text-lg font-extrabold text-slate-900">TalentPulse</span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900">
        Créer votre compte
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Commencez à protéger vos talents dès aujourd&apos;hui.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
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

      <p className="mt-8 text-center text-sm text-slate-500">
        Déjà inscrit ?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
