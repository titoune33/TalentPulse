"use client";

import { useState } from "react";
import { UserRound, ShieldCheck, CheckCircle2 } from "lucide-react";
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Paramètres</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gérez votre profil et la sécurité de votre compte.
        </p>
      </div>

      {/* Profile premium */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5">
            <UserRound className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Profil</h3>
            <p className="text-xs text-slate-500">Vos informations personnelles</p>
          </div>
        </div>

        {profileMsg && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              profileMsg.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="mt-5 flex justify-end">
          <Button onClick={saveProfile} loading={saving}>
            <CheckCircle2 className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Security premium */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-2.5">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Sécurité</h3>
            <p className="text-xs text-slate-500">Modifier votre mot de passe</p>
          </div>
        </div>

        {pwdMsg && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              pwdMsg.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {pwdMsg.text}
          </div>
        )}

        <div className="space-y-4">
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
        <div className="mt-5 flex justify-end">
          <Button onClick={changePassword} loading={changing}>
            Mettre à jour le mot de passe
          </Button>
        </div>
      </div>
    </div>
  );
}
