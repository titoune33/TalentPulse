"use client";

import { useState } from "react";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";

const plans = [
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
    cta: "Passer au Pro",
  },
  {
    name: "Entreprise",
    price: null,
    description: "Sur mesure pour les grands comptes",
    features: [
      "Talents illimités",
      "SSO & rôles avancés",
      "API dédiée",
      "Accompagnement dédié",
    ],
    highlighted: false,
    cta: "Nous contacter",
  },
];

export default function BillingPage() {
  const [toast, setToast] = useState<string | null>(null);

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
            className={`card relative flex flex-col p-6 ${
              plan.highlighted ? "border-primary-500 ring-2 ring-primary-500/30" : ""
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                Recommandé
              </span>
            )}
            <h3 className="font-bold text-slate-900">{plan.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{plan.description}</p>
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
              onClick={() =>
                setToast(
                  `Redirection vers le paiement sécurisé pour le plan ${plan.name}… (démo)`
                )
              }
            >
              <CreditCard className="h-4 w-4" />
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="card flex items-start gap-4 p-5">
        <div className="rounded-xl bg-primary-50 p-2.5">
          <Sparkles className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Paiements en ligne bientôt disponibles
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            L&apos;intégration Stripe est en cours de finalisation. En attendant,
            tous les plans sont accessibles gratuitement pendant la phase de
            démonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
