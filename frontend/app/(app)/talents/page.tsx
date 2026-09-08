"use client";

import { useMemo, useState } from "react";
import { UserPlus, Search, Sparkles, AlertTriangle, Save, X } from "lucide-react";
import { TalentTable } from "@/components/TalentTable";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/EmptyState";
import { RetentionCopilotDrawer } from "@/components/RetentionCopilotDrawer";
import { useTalents } from "@/hooks/useTalents";
import { usePredictions } from "@/hooks/usePredictions";
import { errorMessage } from "@/lib/api";
import type { Talent, TalentInput } from "@/lib/types";

const DEPARTMENTS = [
  "Ingénierie",
  "Produit",
  "Marketing",
  "Ventes",
  "Support",
  "RH",
  "Finance",
];

const emptyForm: TalentInput = {
  first_name: "",
  last_name: "",
  email: "",
  position: "",
  department: "Ingénierie",
  salary: 50000,
  experience_years: 2,
  performance_score: 0.7,
  engagement_score: 0.7,
  satisfaction_score: 0.7,
  skills: [],
};

export default function TalentsPage() {
  const { talents, loading, error, create, update, remove } = useTalents();
  const { predict } = usePredictions();

  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Talent | null>(null);
  const [deleting, setDeleting] = useState<Talent | null>(null);
  const [predicting, setPredicting] = useState<Talent | null>(null);
  const [copilotTalent, setCopilotTalent] = useState<Talent | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [form, setForm] = useState<TalentInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [skillsText, setSkillsText] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return talents.filter((t) => {
      const matchesQ =
        !q ||
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
        (t.position ?? "").toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);
      const matchesDept = !dept || t.department === dept;
      return matchesQ && matchesDept;
    });
  }, [talents, query, dept]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSkillsText("");
    setNotice(null);
    setModalOpen(true);
  };

  const openEdit = (t: Talent) => {
    setEditing(t);
    setForm({
      first_name: t.first_name,
      last_name: t.last_name,
      email: t.email,
      position: t.position ?? "",
      department: t.department ?? "Ingénierie",
      salary: t.salary ?? 50000,
      experience_years: t.experience_years,
      performance_score: t.performance_score,
      engagement_score: t.engagement_score,
      satisfaction_score: t.satisfaction_score,
      skills: t.skills,
    });
    setSkillsText(t.skills.join(", "));
    setNotice(null);
    setModalOpen(true);
  };

  const set = (key: keyof TalentInput, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const payload: TalentInput = {
        ...form,
        salary: Number(form.salary) || 0,
        experience_years: Number(form.experience_years) || 0,
        performance_score: Math.min(1, Math.max(0, Number(form.performance_score) || 0)),
        engagement_score: Math.min(1, Math.max(0, Number(form.engagement_score) || 0)),
        satisfaction_score: Math.min(1, Math.max(0, Number(form.satisfaction_score) || 0)),
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing) {
        await update(editing.id, payload);
        setNotice({ tone: "success", text: "Talent mis à jour avec succès." });
      } else {
        await create(payload);
        setNotice({ tone: "success", text: "Talent ajouté avec succès." });
      }
      setModalOpen(false);
    } catch (e) {
      setNotice({ tone: "error", text: errorMessage(e, "Échec de l'enregistrement") });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      setDeleting(null);
      setNotice({ tone: "success", text: "Talent supprimé." });
    } catch (e) {
      setNotice({ tone: "error", text: errorMessage(e, "Suppression impossible") });
      setDeleting(null);
    }
  };

  const handlePredict = async (t: Talent) => {
    setPredicting(t);
    try {
      await predict(t.id);
      setNotice({
        tone: "success",
        text: `Prédiction lancée pour ${t.first_name} ${t.last_name} — consultez la page Prédictions.`,
      });
    } catch (e) {
      setNotice({ tone: "error", text: errorMessage(e, "Prédiction impossible") });
    } finally {
      setPredicting(null);
    }
  };

  const ScoreSlider = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <Field label={label} hint={`${Math.round(value * 100)}%`}>
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(value * 100)}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </Field>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Talents</h2>
          <p className="mt-1 text-sm text-slate-500">
            {talents.length} collaborateurs suivis
          </p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus className="h-4 w-4" />
          Ajouter un talent
        </Button>
      </div>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Filters premium */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Rechercher un nom, un poste, un email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-56"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          <option value="">Tous les départements</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Erreur de chargement"
          description={error}
        />
      ) : (
        <div className="card overflow-hidden">
          <TalentTable
            talents={filtered}
            onEdit={openEdit}
            onDelete={setDeleting}
            onPredict={handlePredict}
            onOpenCopilot={(t) => {
              setCopilotTalent(t);
              setCopilotOpen(true);
            }}
          />
        </div>
      )}

      {/* Create / Edit modal premium */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le talent" : "Ajouter un talent"}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        {notice && notice.tone === "error" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {notice.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Prénom *">
            <Input
              value={form.first_name ?? ""}
              onChange={(e) => set("first_name", e.target.value)}
              placeholder="Marie"
            />
          </Field>
          <Field label="Nom *">
            <Input
              value={form.last_name ?? ""}
              onChange={(e) => set("last_name", e.target.value)}
              placeholder="Dupont"
            />
          </Field>
          <Field label="Email *" hint="Identifiant unique dans la plateforme">
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              placeholder="marie.dupont@entreprise.com"
            />
          </Field>
          <Field label="Poste">
            <Input
              value={form.position ?? ""}
              onChange={(e) => set("position", e.target.value)}
              placeholder="Développeuse Full-Stack"
            />
          </Field>
          <Field label="Département">
            <Select
              value={form.department ?? ""}
              onChange={(e) => set("department", e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Salaire annuel (€)">
            <Input
              type="number"
              value={form.salary ?? ""}
              onChange={(e) => set("salary", e.target.value)}
            />
          </Field>
          <Field label="Années d'expérience">
            <Input
              type="number"
              min={0}
              max={45}
              value={form.experience_years ?? ""}
              onChange={(e) => set("experience_years", e.target.value)}
            />
          </Field>
          <Field label="Compétences" hint="Séparées par des virgules">
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Python, React, SQL"
            />
          </Field>
        </div>

        {/* Score sliders premium */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ScoreSlider
            label="Performance"
            value={form.performance_score ?? 0}
            onChange={(v) => set("performance_score", v)}
          />
          <ScoreSlider
            label="Engagement"
            value={form.engagement_score ?? 0}
            onChange={(v) => set("engagement_score", v)}
          />
          <ScoreSlider
            label="Satisfaction"
            value={form.satisfaction_score ?? 0}
            onChange={(v) => set("satisfaction_score", v)}
          />
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Supprimer ce talent ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Vous êtes sur le point de supprimer{" "}
          <strong>
            {deleting?.first_name} {deleting?.last_name}
          </strong>
          . Cette action est irréversible.
        </p>
      </Modal>

      {/* Prediction modal */}
      <Modal
        open={!!predicting}
        onClose={() => setPredicting(null)}
        title="Prédiction en cours"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 animate-pulse text-indigo-600" />
          <p className="text-sm text-slate-600">
            Calcul du risque de départ pour{" "}
            <strong>
              {predicting?.first_name} {predicting?.last_name}
            </strong>
            …
          </p>
        </div>
      </Modal>

      {/* Retention Copilot Drawer */}
      <RetentionCopilotDrawer
        talent={copilotTalent}
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
}
