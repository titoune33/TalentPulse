"use client";

import { useState } from "react";
import { Check, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { api, errorMessage } from "@/lib/api";
import type { Plan } from "@/lib/types";

const plans: Plan[] = [
  {
    name: "Starter",
    price: 29,
    description: "Pour les petites équipes RH",
    features: [
      "Jusqu'à 50 talents",
      "Prédictions de turnover",
      "Tableau de bord",
      "Support par email",
    ],
    highlighted: false,
    cta: "Commencer",
  },
  {
    name: "Pro",
    price: 79,
    description: "Pour les équipes en croissance",
    features: [
      "Jusqu'à 500 talents",
      "Prédictions illimitées",
      "Analytics avancés",
      "Rapports exportables",
      "Support prioritaire",
    ],
    highlighted: true,
    cta: "Essayer gratuitement",
  },
  {
    name: "Entreprise",
    price: null,
    description: "Sur mesure pour les grands comptes",
    features: [
      "Talents illimités",
      "SSO & rôles avancées",
      "API dédiée",
      "Accompagnement dédié",
    ],
    highlighted: false,
    cta: "Nous contacter",
  },
];

// Map plan name to Stripe price IDs (set via env vars at build time)
const PRICE_IDS: Record<string, string | undefined> = {
  Starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  Pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  Entreprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE,
};

export default function BillingPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    const priceId = PRICE_IDS[planName];
    if (!priceId) {
      setToast(
        `Le paiement pour le plan ${planName} n'est pas encore configuré. Contactez-nous.`
      );
      return;
    }

    setLoadingPlan(planName);
    setToast(null);
    try {
      const { data } = await api.post("/api/billing/create-checkout-session", {
        price_id: priceId,
      });
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setToast(errorMessage(e, "Erreur lors de la redirection vers le paiement."));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Abonnement</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choisissez le plan adapté à la taille de vos équipes. Sans engagement.
        </p>
      </div>

      {toast && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-card ${
              plan.highlighted
                ? "border-indigo-500 ring-1 ring-indigo-500/30"
                : "border-slate-200"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                Recommandé
              </span>
            )}
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`rounded-xl p-2.5 ${
                  plan.highlighted
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-slate-50 text-slate-600"
                }`}
              >
                {plan.price ? <CreditCard className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              {plan.price ? (
                <>
                  <span className="text-3xl font-extrabold text-slate-900">
                    {plan.price}€
                  </span>
                  <span className="text-sm text-slate-400">/ mois</span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-slate-900">Sur mesure</span>
              )}
            </div>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlighted ? "primary" : "secondary"}
              className="mt-6 w-full"
              loading={loadingPlan === plan.name}
              onClick={() => handleSubscribe(plan.name)}
            >
              {loadingPlan === plan.name ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="card flex items-start gap-4 p-5">
        <div className="rounded-xl bg-indigo-50 p-2.5">
          <Sparkles className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Paiements en ligne bientôt disponibles
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            L'intégration Stripe est prête. Rendez-vous sur la page Stripe pour
            configurer vos produits et prix, puis connectez-les via nos variables
            d'environnement.
          </p>
        </div>
      </div>
    </div>
  );
}
