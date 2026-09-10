"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Sparkles, Loader2, ShieldCheck, Zap, Info } from "lucide-react";
import { Button } from "@/components/Button";
import { api, errorMessage } from "@/lib/api";

interface CataloguePlan {
  id: string;
  name: string;
  price_eur: number | null;
  limit: string;
  price_id: string | null;
}

interface PlansResponse {
  stripe_configured: boolean;
  plans: CataloguePlan[];
}

interface CurrentPlan {
  plan: string;
  stripe_configured: boolean;
}

/** Marketing copy for each plan; the price id itself comes from the backend. */
const PLAN_COPY: Record<
  string,
  { description: string; features: string[]; highlighted: boolean; cta: string }
> = {
  starter: {
    description: "Pour les startups et petites équipes RH jusqu'à 50 personnes",
    features: [
      "Jusqu'à 50 talents suivis",
      "Scoring du risque par RandomForest",
      "Tableau de bord exécutif",
      "Rapports exportables (CSV / impression)",
    ],
    highlighted: false,
    cta: "Choisir Starter",
  },
  pro: {
    description: "Pour les scale-ups et PME en croissance (50 à 250 talents)",
    features: [
      "Jusqu'à 250 talents suivis",
      "Plan de rétention 1-to-1 par collaborateur",
      "Analytics sur 13 semaines",
      "Export CSV et rapport imprimable pour le Comex",
    ],
    highlighted: true,
    cta: "Passer à l'offre Pro",
  },
  enterprise: {
    description: "Sur mesure pour les organisations au-delà de 250 personnes",
    features: [
      "Collaborateurs illimités",
      "Déploiement sur votre infrastructure",
      "Réentraînement du modèle sur vos données",
      "Accompagnement à la mise en service",
    ],
    highlighted: false,
    cta: "Nous contacter",
  },
};

export default function BillingPage() {
  const [catalogue, setCatalogue] = useState<PlansResponse | null>(null);
  const [current, setCurrent] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.all([
        api.get<PlansResponse>("/api/billing/plans"),
        api.get<CurrentPlan>("/api/billing/plan"),
      ]);
      setCatalogue(plansRes.data);
      setCurrent(currentRes.data);
    } catch (e) {
      setToast({ tone: "error", text: errorMessage(e, "Impossible de charger les offres") });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubscribe = async (plan: CataloguePlan) => {
    if (plan.id === "enterprise") {
      window.location.href =
        "mailto:contact@talentpulse.app?subject=Demande%20de%20devis%20TalentPulse%20Entreprise";
      return;
    }
    if (catalogue?.stripe_configured && !plan.price_id) {
      setToast({ tone: "error", text: `Le tarif ${plan.name} n'est pas configuré côté serveur.` });
      return;
    }

    setLoadingPlan(plan.id);
    setToast(null);
    try {
      const { data } = await api.post("/api/billing/create-checkout-session", {
        price_id: plan.price_id,
      });
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      // Demo mode: the backend switched the account to Pro.
      setToast({ tone: "info", text: data.message });
      await load();
    } catch (e) {
      setToast({
        tone: "error",
        text: errorMessage(e, "Erreur lors de la mise à jour de l'abonnement."),
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Gestion de l&apos;abonnement
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choisissez le plan adapté à la taille de vos effectifs. Changement ou annulation à tout
            moment.
          </p>
        </div>
        {current && (
          <span className="rounded-full bg-slate-900 px-3.5 py-1.5 font-mono text-xs font-semibold text-white">
            Plan actuel : {current.plan}
          </span>
        )}
      </div>

      {toast && (
        <div
          className={`rounded-xl border px-4 py-3.5 text-sm shadow-sm flex items-start gap-3 ${
            toast.tone === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-primary-200 bg-primary-50 text-primary-800"
          }`}
        >
          {toast.tone === "error" ? (
            <Info className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          ) : (
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5 text-primary-600" />
          )}
          <p>{toast.text}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
          {(catalogue?.plans ?? []).map((plan) => {
            const copy = PLAN_COPY[plan.id] ?? {
              description: "",
              features: [],
              highlighted: false,
              cta: "Choisir",
            };
            const isCurrent = current?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-7 transition-all duration-200 ${
                  copy.highlighted
                    ? "border-primary-600 ring-2 ring-primary-600/20 shadow-float"
                    : "border-slate-200 shadow-card hover:border-slate-300"
                }`}
              >
                {copy.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                    Recommandé
                  </span>
                )}

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                    <div
                      className={`rounded-xl p-2.5 ${
                        copy.highlighted
                          ? "bg-primary-50 text-primary-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {copy.highlighted ? (
                        <Zap className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">{copy.description}</p>

                  <div className="mt-5 flex items-baseline gap-1 border-b border-slate-100 pb-5">
                    {plan.price_eur ? (
                      <>
                        <span className="font-mono text-4xl font-extrabold text-slate-900">
                          {plan.price_eur} €
                        </span>
                        <span className="text-xs text-slate-500">/ mois</span>
                      </>
                    ) : (
                      <span className="font-mono text-3xl font-extrabold text-slate-900">Sur mesure</span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {copy.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    variant={copy.highlighted ? "accent" : "secondary"}
                    size="md"
                    className="w-full"
                    disabled={isCurrent || loadingPlan === plan.id}
                    loading={loadingPlan === plan.id}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {isCurrent ? "Plan actuel" : copy.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60 border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Paiement et données</h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              Les paiements sont traités par Stripe : aucune donnée bancaire ne transite par
              TalentPulse. Vos données RH restent dans votre instance et ne servent jamais à
              entraîner un modèle partagé.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-200/80 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          Sans engagement
        </span>
      </div>
    </div>
  );
}
