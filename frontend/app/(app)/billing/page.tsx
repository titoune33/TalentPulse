"use client";

import { useState } from "react";
import { Check, CreditCard, Sparkles, Loader2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/Button";
import { api, errorMessage } from "@/lib/api";
import type { Plan } from "@/lib/types";

const plans: Plan[] = [
  {
    name: "Starter",
    price: 49,
    description: "Pour les startups et petites équipes RH jusqu'à 50 personnes",
    features: [
      "Jusqu'à 50 talents suivis",
      "Calcul du risque par RandomForest",
      "Tableau de bord exécutif",
      "Alertes turnover par email",
      "Support standard sous 24h",
    ],
    highlighted: false,
    cta: "Choisir Starter",
  },
  {
    name: "Pro",
    price: 149,
    description: "Pour les scale-ups et PME en croissance (50 à 250 talents)",
    features: [
      "Jusqu'à 250 talents suivis",
      "Copilot de Rétention IA (guide 1-to-1)",
      "Analytics prédictifs sur 13 semaines",
      "Rapports exécutifs PDF pour le Comex",
      "Support prioritaire dédié",
    ],
    highlighted: true,
    cta: "Passer à l'offre Pro",
  },
  {
    name: "Entreprise",
    price: null,
    description: "Sur mesure pour les organisations au-delà de 250 personnes",
    features: [
      "Collaborateurs illimités",
      "Intégration SIRH (Lucca, Workday)",
      "Modèle ML entraîné sur mesure",
      "SSO d'entreprise & audit logs",
      "Consultant RH dédié",
    ],
    highlighted: false,
    cta: "Nous contacter",
  },
];

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
        `L'intégration Stripe Checkout directe est activable dès configuration de votre clé STRIPE_SECRET_KEY dans le backend. En attendant, votre compte démo dispose des fonctionnalités Pro débloquées.`
      );
      return;
    }

    setLoadingPlan(planName);
    setToast(null);
    try {
      const { data } = await api.post("/api/billing/create-checkout-session", {
        price_id: priceId,
      });
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Gestion de l'Abonnement
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choisissez le plan adapté à la taille de vos effectifs. Changement ou annulation à tout moment.
        </p>
      </div>

      {toast && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3.5 text-sm text-primary-800 shadow-sm flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
          <p>{toast}</p>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col justify-between rounded-2xl border bg-white p-7 transition-all duration-200 ${
              plan.highlighted
                ? "border-primary-600 ring-2 ring-primary-600/20 shadow-float"
                : "border-slate-200 shadow-card hover:border-slate-300"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                Recommandé
              </span>
            )}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                <div
                  className={`rounded-xl p-2.5 ${
                    plan.highlighted
                      ? "bg-primary-50 text-primary-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {plan.highlighted ? <Zap className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1 border-b border-slate-100 pb-5">
                {plan.price ? (
                  <>
                    <span className="font-mono text-4xl font-extrabold text-slate-900">
                      {plan.price} €
                    </span>
                    <span className="text-xs text-slate-500">/ mois</span>
                  </>
                ) : (
                  <span className="font-mono text-3xl font-extrabold text-slate-900">Sur mesure</span>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Button
                variant={plan.highlighted ? "accent" : "secondary"}
                size="md"
                className="w-full"
                loading={loadingPlan === plan.name}
                onClick={() => handleSubscribe(plan.name)}
              >
                {loadingPlan === plan.name ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                {plan.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Stripe & ROI Banner */}
      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60 border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Garantie d'efficacité & Sécurité des données
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paiements sécurisés par Stripe. Données chiffrées hébergées exclusivement en Europe (RGPD).
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
