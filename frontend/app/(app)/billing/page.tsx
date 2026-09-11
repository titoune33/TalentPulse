"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Loader2, ShieldCheck, Info } from "lucide-react";
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
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Pilotage du risque</p>
          <h2 className="mt-2 text-h2 font-semibold">Gestion de l&apos;abonnement</h2>
          <p className="mt-1.5 max-w-2xl text-base text-ink-2">
            Choisissez le plan adapté à la taille de vos effectifs. Changement ou annulation à tout
            moment.
          </p>
        </div>
        {current && (
          <span className="inline-flex items-center rounded border border-line-strong bg-sunken px-3 py-1.5 font-mono text-micro font-medium uppercase text-ink-2">
            Plan actuel : {current.plan}
          </span>
        )}
      </header>

      {toast && (
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 text-small ${
            toast.tone === "error"
              ? "border-danger-100 bg-danger-50 text-danger-700"
              : "border-accent-100 bg-accent-50 text-accent-800"
          }`}
        >
          <Info
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              toast.tone === "error" ? "text-danger-600" : "text-accent-600"
            }`}
            aria-hidden="true"
          />
          <p>{toast.text}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-ink-4" aria-hidden="true" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
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
                className={`relative flex flex-col justify-between rounded-xl border bg-surface p-7 ${
                  copy.highlighted
                    ? "border-accent-600"
                    : "border-line transition-colors duration-200 hover:border-line-strong"
                }`}
              >
                {copy.highlighted && (
                  <span className="absolute -top-2.5 left-7 bg-surface px-2 font-mono text-micro font-medium uppercase text-accent-700">
                    Recommandé
                  </span>
                )}

                <div>
                  <h3 className="text-title font-semibold">{plan.name}</h3>

                  <p className="mt-2 min-h-[40px] text-small leading-relaxed text-ink-2">
                    {copy.description}
                  </p>

                  <div className="mt-5 flex items-baseline gap-1.5 border-b border-line pb-5">
                    {plan.price_eur ? (
                      <>
                        <span className="figure text-h1">{plan.price_eur} €</span>
                        <span className="text-small text-ink-3">/ mois</span>
                      </>
                    ) : (
                      <span className="figure text-h3">Sur mesure</span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {copy.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-small text-ink-2">
                        <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-ok-600" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 border-t border-line pt-5">
                  <Button
                    variant={copy.highlighted ? "accent" : "secondary"}
                    size="md"
                    className="w-full"
                    disabled={isCurrent || loadingPlan === plan.id}
                    loading={loadingPlan === plan.id}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isCurrent ? "Plan actuel" : copy.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="panel flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
          <div>
            <h3 className="text-title font-semibold">Paiement et données</h3>
            <p className="mt-1 max-w-xl text-small text-ink-2">
              Les paiements sont traités par Stripe : aucune donnée bancaire ne transite par
              TalentPulse. Vos données RH restent dans votre instance et ne servent jamais à
              entraîner un modèle partagé.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center rounded border border-line-strong bg-sunken px-3 py-1 font-mono text-micro font-medium uppercase text-ink-2">
          Sans engagement
        </span>
      </div>
    </div>
  );
}
