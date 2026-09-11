"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { useAuth } from "@/lib/auth";
import { api, errorMessage } from "@/lib/api";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const saveProfile = async () => {
    setSaving(true);
    setProfileMsg(null);
    try {
      const { data } = await api.put<User>("/api/auth/me", { name, email });
      updateUser(data);
      setProfileMsg({ tone: "success", text: "Profil mis à jour." });
    } catch (e) {
      setProfileMsg({ tone: "error", text: errorMessage(e, "Mise à jour impossible") });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      setPwdMsg({ tone: "error", text: "Le nouveau mot de passe doit faire au moins 8 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ tone: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setChanging(true);
    setPwdMsg(null);
    try {
      await api.post("/api/auth/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwdMsg({ tone: "success", text: "Mot de passe modifié avec succès." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwdMsg({ tone: "error", text: errorMessage(e, "Changement impossible") });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="max-w-[720px]">
      <header className="border-b border-line pb-5">
        <p className="eyebrow">Pilotage du risque</p>
        <h2 className="mt-2 text-h2 font-semibold">Paramètres</h2>
        <p className="mt-1.5 max-w-2xl text-base text-ink-2">
          Gérez votre profil et la sécurité de votre compte.
        </p>
      </header>

      {/* Profil — première section du formulaire. */}
      <section className="border-b border-line py-8">
        <h3 className="text-title font-semibold">Profil</h3>
        <p className="mt-1 text-small text-ink-3">Vos informations personnelles.</p>

        {profileMsg && (
          <div
            className={`mt-5 border-l-2 px-4 py-3 text-small ${
              profileMsg.tone === "success"
                ? "border-ok-600 bg-ok-50 text-ok-700"
                : "border-danger-600 bg-danger-50 text-danger-700"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom complet">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={saveProfile} loading={saving}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Enregistrer
          </Button>
        </div>
      </section>

      {/* Sécurité — deuxième section, séparée par le filet de la première. */}
      <section className="py-8">
        <h3 className="text-title font-semibold">Sécurité</h3>
        <p className="mt-1 text-small text-ink-3">Modifier votre mot de passe.</p>

        {pwdMsg && (
          <div
            className={`mt-5 border-l-2 px-4 py-3 text-small ${
              pwdMsg.tone === "success"
                ? "border-ok-600 bg-ok-50 text-ok-700"
                : "border-danger-600 bg-danger-50 text-danger-700"
            }`}
          >
            {pwdMsg.text}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <Field label="Mot de passe actuel">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nouveau mot de passe" hint="8 caractères minimum">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirmer le mot de passe">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={changePassword} loading={changing}>
            Mettre à jour le mot de passe
          </Button>
        </div>
      </section>
    </div>
  );
}
