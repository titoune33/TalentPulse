"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Menu,
  X,
  PlayCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/Button";

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const facts = [
  { value: "5", label: "Signaux analysés par collaborateur" },
  { value: "13 sem.", label: "D'historique de risque par équipe" },
  { value: "< 5 min", label: "Pour démarrer en local" },
  { value: "100 %", label: "Auto-hébergeable sur votre infra" },
];

const productTours = [
  {
    index: "01",
    eyebrow: "Cartographie",
    title: "Voir le risque, pas un tableau de plus",
    body:
      "Chaque collaborateur reçoit un score de 0 à 100 % calculé par un classifieur RandomForest à partir de cinq indicateurs. Le tableau de bord remonte les cas critiques, la répartition par niveau et l'exposition financière correspondante.",
    bullets: [
      "Score recalculé à la demande, historique conservé",
      "Seuil critique paramétrable (70 % par défaut)",
      "Estimation du coût des départs à venir",
    ],
    image: "/product/dashboard.png",
    alt: "Tableau de bord exécutif de TalentPulse avec KPI, répartition des risques et top 5 des talents prioritaires",
  },
  {
    index: "02",
    eyebrow: "Action",
    title: "Savoir quoi dire en entretien",
    body:
      "Un score ne retient personne. Le plan de rétention traduit les signaux faibles en diagnostic, en questions d'entretien concrètes et en simulation de contre-mesure — revalorisation, objectif de satisfaction, impact estimé sur le risque.",
    bullets: [
      "Diagnostic des facteurs qui pèsent réellement",
      "Guide d'entretien 1-to-1 prêt à l'emploi",
      "Simulateur de contre-mesure avant l'entretien",
    ],
    image: "/product/plan-retention.png",
    alt: "Plan de rétention d'un collaborateur : diagnostic, guide d'entretien et simulateur de contre-mesure",
  },
  {
    index: "03",
    eyebrow: "Restitution",
    title: "Arriver au COMEX avec un document",
    body:
      "Le rapport exécutif réunit l'effectif, le risque moyen, les talents prioritaires et les recommandations associées. Il s'imprime en PDF depuis le navigateur ou s'exporte en CSV pour votre SIRH — sans dépendre d'un connecteur propriétaire.",
    bullets: [
      "Synthèse lisible par un dirigeant non-RH",
      "Export CSV de tout le registre, encodage Excel",
      "Impression PDF via le navigateur",
    ],
    image: "/product/rapport.png",
    alt: "Rapport exécutif TalentPulse : KPI, talents prioritaires et synthèse",
  },
];

const features = [
  {
    title: "Score explicable",
    body: "Cinq facteurs, un poids lisible. Vous savez toujours pourquoi un collaborateur remonte dans la liste.",
  },
  {
    title: "Historique 13 semaines",
    body: "L'évolution du risque par équipe, pas seulement une photo à l'instant T.",
  },
  {
    title: "Seuil critique",
    body: "Tout franchissement du seuil fait remonter le profil en tête du tableau de bord.",
  },
  {
    title: "Plan de rétention 1-to-1",
    body: "Diagnostic, questions d'entretien et simulation de contre-mesure pour chaque profil.",
  },
  {
    title: "Restitution dirigeant",
    body: "Rapport imprimable et export CSV complet, sans format propriétaire.",
  },
  {
    title: "Réentraînable",
    body: "Quand vos départs confirmés s'accumulent, le modèle se réentraîne sur vos données.",
  },
];

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: 49,
    yearly: 39,
    audience: "Startups et équipes RH jusqu'à 50 collaborateurs",
    features: [
      "Jusqu'à 50 talents suivis",
      "Scoring du risque par RandomForest",
      "Tableau de bord exécutif",
      "Rapports exportables (CSV / impression)",
      "Support par email",
    ],
    highlighted: false,
    cta: "Choisir Starter",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 149,
    yearly: 119,
    audience: "PME et scale-ups de 50 à 250 collaborateurs",
    features: [
      "Jusqu'à 250 talents suivis",
      "Plan de rétention 1-to-1 par collaborateur",
      "Analytics sur 13 semaines",
      "Rapport de direction et export CSV",
      "Support prioritaire",
    ],
    highlighted: true,
    cta: "Passer à Pro",
  },
  {
    id: "enterprise",
    name: "Entreprise",
    monthly: null,
    yearly: null,
    audience: "Organisations au-delà de 250 collaborateurs",
    features: [
      "Collaborateurs illimités",
      "Déploiement sur votre infrastructure",
      "Modèle réentraîné sur vos données",
      "Intégration SIRH sur mesure (API REST)",
      "Accompagnement à la mise en service",
    ],
    highlighted: false,
    cta: "Nous contacter",
  },
];

const faqs = [
  {
    q: "Quelles données RH sont nécessaires pour alimenter les prédictions ?",
    a: "TalentPulse se base sur 5 indicateurs : le niveau de performance, l'engagement, le score de satisfaction, l'ancienneté en années et la rémunération. Ils se saisissent dans l'interface ou s'envoient directement à l'API REST documentée (OpenAPI).",
  },
  {
    q: "Comment fonctionne l'algorithme de Machine Learning ?",
    a: "Le score de risque est produit par un classifieur RandomForest. L'instance est livrée avec un modèle entraîné sur un jeu de données RH de référence, et l'endpoint /api/predictions/train permet de le réentraîner sur vos propres collaborateurs dès que des départs confirmés sont enregistrés.",
  },
  {
    q: "Où vivent les données de nos collaborateurs ?",
    a: "Dans l'instance que vous déployez, sur votre base PostgreSQL ou SQLite. Aucune donnée nominative ne quitte votre infrastructure et rien ne sert à entraîner un modèle partagé. Les exports CSV restent sous votre contrôle, ce qui facilite la conformité RGPD et la tenue du registre de traitement.",
  },
  {
    q: "En combien de temps le retour sur investissement (ROI) est-il atteint ?",
    a: "Le simulateur ci-dessus utilise une hypothèse prudente : un remplacement coûte environ 50 % du salaire annuel brut (recrutement, montée en compétence, perte de vélocité). Éviter un seul départ suffit à couvrir plusieurs années d'abonnement — ajustez les curseurs à votre réalité avant de vous engager.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  // ROI simulator
  const [headcount, setHeadcount] = useState(75);
  const [avgSalary, setAvgSalary] = useState(52000);
  const [turnoverRate, setTurnoverRate] = useState(14);

  const departures = Math.max(1, Math.round(headcount * (turnoverRate / 100)));
  const costPerDeparture = Math.round(avgSalary * 0.5);
  const totalCost = departures * costPerDeparture;
  const savedDepartures = Math.max(1, Math.round(departures * 0.35));
  const annualSavings = savedDepartures * costPerDeparture;
  const licenceCost = headcount <= 50 ? 588 : 1788;
  const roiMultiplier = Math.max(1, Math.round(annualSavings / licenceCost));

  // Retention simulator (product preview)
  const [salaryLever, setSalaryLever] = useState(0);
  const [satisfactionLever, setSatisfactionLever] = useState(4.5);
  const previewRisk = Math.min(
    0.95,
    Math.max(0.15, 0.82 - salaryLever * 0.02 - (satisfactionLever - 4.5) * 0.08)
  );

  const navLinks = [
    { href: "#produit", label: "Produit" },
    { href: "#video", label: "Démo" },
    { href: "#simulateur", label: "Simulateur" },
    { href: "#tarifs", label: "Tarifs" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* ============================ NAV ============================ */}
      <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white">
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
            <span className="text-[15px] font-semibold tracking-[-0.01em]">
              Talent<span className="text-ink-3">Pulse</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-small text-ink-2 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="primary" size="sm">
                Explorer la démo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-2 text-ink-2 transition hover:bg-sunken md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="animate-fadeIn border-t border-line bg-surface px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-small text-ink-2 transition hover:bg-sunken"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
              <Link href="/auth/login" className="w-full">
                <Button variant="secondary" size="md" className="w-full">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  Explorer la démo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ============================ HERO ============================ */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-70" aria-hidden />

          <div className="container-page relative pt-16 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center">Prédiction du turnover · RandomForest</p>

              <h1 className="mt-6 text-h1 font-semibold sm:text-display">
                Sachez qui va partir
                <span className="block font-display font-normal italic tracking-[-0.02em] text-ink-2">
                  avant qu&apos;il ne démissionne.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lead text-ink-2">
                TalentPulse note chacun de vos collaborateurs de 0 à 100 % à partir de cinq
                signaux RH — performance, engagement, satisfaction, ancienneté, rémunération —
                puis transforme ce score en plan d&apos;action pour le manager.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Explorer la démo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#simulateur" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Calculer mes économies
                  </Button>
                </a>
              </div>

              <p className="mt-5 font-mono text-micro uppercase text-ink-3">
                Démonstration immédiate · Aucune carte bancaire · Auto-hébergeable
              </p>
            </div>

            {/* Real product screenshot */}
            <div className="relative mx-auto mt-14 max-w-5xl">
              <div className="frame">
                <div className="frame-bar">
                  <span className="frame-dot" />
                  <span className="frame-dot" />
                  <span className="frame-dot" />
                  <span className="ml-3 truncate rounded bg-surface px-2.5 py-1 font-mono text-[11px] text-ink-3">
                    talentpulse — tableau de bord exécutif
                  </span>
                </div>
                <Image
                  src="/product/dashboard.png"
                  alt="Tableau de bord exécutif de TalentPulse : KPI de risque, répartition des niveaux et top 5 des talents prioritaires"
                  width={2400}
                  height={1500}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          {/* Fact strip */}
          <div className="container-page relative mt-16">
            <dl className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
              {facts.map((f, i) => (
                <div
                  key={f.label}
                  className={`px-1 py-6 lg:px-6 ${i > 0 ? "lg:border-l lg:border-line" : ""} ${
                    i % 2 === 1 ? "border-l border-line pl-5 lg:pl-6" : ""
                  }`}
                >
                  <dt className="figure text-h3">{f.value}</dt>
                  <dd className="mt-1.5 text-small text-ink-3">{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ======================= PRODUCT TOUR ======================= */}
        <section id="produit" className="section border-b border-line">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">Le produit</p>
              <h2 className="mt-4 text-h2 font-semibold">
                Trois écrans, dans l&apos;ordre où vous en avez besoin.
              </h2>
              <p className="mt-4 text-base text-ink-2">
                Pas de module à installer, pas de connecteur à négocier. Vous ouvrez, vous voyez
                le risque, vous savez quoi faire.
              </p>
            </div>

            <div className="mt-16 space-y-20">
              {productTours.map((tour, i) => (
                <div
                  key={tour.index}
                  className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
                >
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-baseline gap-3">
                      <span className="figure text-micro text-ink-4">{tour.index}</span>
                      <span className="font-mono text-micro uppercase tracking-[0.09em] text-accent-600">
                        {tour.eyebrow}
                      </span>
                    </div>
                    <h3 className="mt-3 text-h3 font-semibold">{tour.title}</h3>
                    <p className="mt-3.5 text-base leading-relaxed text-ink-2">{tour.body}</p>
                    <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
                      {tour.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-small text-ink-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok-600" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="frame">
                      <div className="frame-bar">
                        <span className="frame-dot" />
                        <span className="frame-dot" />
                        <span className="frame-dot" />
                      </div>
                      <Image
                        src={tour.image}
                        alt={tour.alt}
                        width={2000}
                        height={1250}
                        loading="lazy"
                        className="h-auto w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ VIDEO ============================ */}
        <section id="video" className="section border-b border-line bg-surface">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow justify-center">Démonstration</p>
              <h2 className="mt-4 text-h2 font-semibold">TalentPulse en 30 secondes</h2>
              <p className="mt-4 text-base text-ink-2">
                Le parcours complet : détection d&apos;un risque critique, plan de rétention,
                restitution au comité de direction.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-4xl">
              <div className="frame">
                <div className="frame-bar">
                  <span className="frame-dot" />
                  <span className="frame-dot" />
                  <span className="frame-dot" />
                  <span className="ml-3 font-mono text-[11px] text-ink-3">demo — 0:30</span>
                </div>
                <video
                  className="h-auto w-full bg-graphite-900"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/product/demo-poster.jpg"
                >
                  <source src="/product/demo.mp4" type="video/mp4" />
                  Votre navigateur ne prend pas en charge la lecture vidéo.
                  <a href="/product/demo.mp4">Télécharger la démonstration</a>.
                </video>
              </div>

              <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="font-mono text-micro uppercase text-ink-3">
                  Sans son · Sous-titres français incrustés
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-small font-medium text-accent-600 transition hover:text-accent-700"
                >
                  Essayer vous-même sur la démo
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================== SIMULATEUR ========================== */}
        <section id="simulateur" className="section border-b border-line">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">Simulateur</p>
              <h2 className="mt-4 text-h2 font-semibold">
                Le coût du turnover, chiffré pour votre effectif.
              </h2>
              <p className="mt-4 text-base text-ink-2">
                Ajustez trois curseurs. Les hypothèses de calcul sont affichées sous le
                simulateur : vous pouvez les contester, pas les subir.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-2">
              {/* Controls */}
              <div className="bg-surface p-7 sm:p-9">
                <div className="space-y-8">
                  <div>
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <label htmlFor="headcount" className="text-small font-medium text-ink">
                        Nombre de collaborateurs
                      </label>
                      <span className="figure text-small">{headcount} personnes</span>
                    </div>
                    <input
                      id="headcount"
                      type="range"
                      min={20}
                      max={500}
                      step={5}
                      value={headcount}
                      onChange={(e) => setHeadcount(Number(e.target.value))}
                    />
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-4">
                      <span>20</span>
                      <span>250</span>
                      <span>500</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <label htmlFor="avg-salary" className="text-small font-medium text-ink">
                        Salaire brut annuel moyen
                      </label>
                      <span className="figure text-small">
                        {avgSalary.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                    <input
                      id="avg-salary"
                      type="range"
                      min={30000}
                      max={120000}
                      step={2000}
                      value={avgSalary}
                      onChange={(e) => setAvgSalary(Number(e.target.value))}
                    />
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-4">
                      <span>30 k€</span>
                      <span>75 k€</span>
                      <span>120 k€</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <label htmlFor="turnover-rate" className="text-small font-medium text-ink">
                        Taux de turnover annuel
                      </label>
                      <span className="figure text-small">{turnoverRate} %</span>
                    </div>
                    <input
                      id="turnover-rate"
                      type="range"
                      min={5}
                      max={35}
                      step={1}
                      value={turnoverRate}
                      onChange={(e) => setTurnoverRate(Number(e.target.value))}
                    />
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-4">
                      <span>5 %</span>
                      <span>15 % (moyenne)</span>
                      <span>35 %</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-ink p-7 text-white sm:p-9">
                <p className="font-mono text-micro uppercase tracking-[0.09em] text-white/50">
                  Impact annuel estimé
                </p>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-small text-white/60">Départs subis</p>
                    <p className="figure mt-1.5 text-h3 text-white">~{departures}</p>
                  </div>
                  <div>
                    <p className="text-small text-white/60">Coût annuel</p>
                    <p className="figure mt-1.5 text-h3 text-white">
                      {totalCost.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/15 pt-7">
                  <p className="text-small text-white/60">Économies nettes avec TalentPulse</p>
                  <p
                    data-testid="annual-savings"
                    className="figure mt-2 text-[2.5rem] leading-none text-white"
                  >
                    +{annualSavings.toLocaleString("fr-FR")} €
                  </p>
                  <p className="mt-2 text-small text-white/60">
                    soit {savedDepartures} collaborateur{savedDepartures > 1 ? "s" : ""} clé
                    {savedDepartures > 1 ? "s" : ""} conservé{savedDepartures > 1 ? "s" : ""} par an
                  </p>
                </div>

                <div className="mt-8 flex items-end justify-between border-t border-white/15 pt-6">
                  <div>
                    <p className="font-mono text-micro uppercase text-white/50">
                      Retour sur investissement
                    </p>
                    <p className="figure mt-1 text-h3 text-white">×{roiMultiplier}</p>
                  </div>
                  <Link href="/auth/login">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 hover:text-white"
                    >
                      Explorer la démo
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink-3">
              Hypothèses : remplacement = 50 % du salaire brut annuel · réduction du turnover de
              35 % avec TalentPulse · licence annuelle de {licenceCost.toLocaleString("fr-FR")} €
              ({headcount <= 50 ? "offre Starter" : "offre Pro"}, remise annuelle incluse).
            </p>
          </div>
        </section>

        {/* ===================== RETENTION PREVIEW ===================== */}
        <section className="section border-b border-line bg-surface">
          <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">Aperçu</p>
              <h2 className="mt-4 text-h2 font-semibold">
                Un score ne retient personne. Un plan, si.
              </h2>
              <p className="mt-4 text-base text-ink-2">
                Testez l&apos;effet de deux leviers de rétention sur un profil à risque critique.
                C&apos;est exactement ce que fait le plan de rétention dans l&apos;application.
              </p>

              <div className="mt-8 space-y-7 rounded-xl border border-line bg-paper p-6">
                <div>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <label htmlFor="preview-salary" className="text-small font-medium text-ink">
                      Ajustement salarial
                    </label>
                    <span className="figure text-small">
                      {salaryLever > 0 ? `+${salaryLever}%` : salaryLever === 0 ? "Aucun" : `${salaryLever}%`}
                    </span>
                  </div>
                  <input
                    id="preview-salary"
                    type="range"
                    min={-10}
                    max={15}
                    step={1}
                    value={salaryLever}
                    onChange={(e) => setSalaryLever(Number(e.target.value))}
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <label htmlFor="preview-satisfaction" className="text-small font-medium text-ink">
                      Objectif de satisfaction
                    </label>
                    <span className="figure text-small">
                      {satisfactionLever.toFixed(1)} <span className="text-ink-4">/ 10</span>
                    </span>
                  </div>
                  <input
                    id="preview-satisfaction"
                    type="range"
                    min={2}
                    max={10}
                    step={0.5}
                    value={satisfactionLever}
                    onChange={(e) => setSatisfactionLever(Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-line pt-5">
                  <span className="text-small text-ink-2">Risque estimé après action</span>
                  <span
                    className={`figure text-h3 ${
                      previewRisk >= 0.7
                        ? "text-danger-600"
                        : previewRisk >= 0.4
                          ? "text-warn-600"
                          : "text-ok-600"
                    }`}
                  >
                    {Math.round(previewRisk * 100)} %
                  </span>
                </div>
              </div>

              <p className="mt-3 font-mono text-[11px] text-ink-3">
                Simulation indicative sur un profil type (satisfaction initiale 4,5/10).
              </p>
            </div>

            <div className="frame">
              <div className="frame-bar">
                <span className="frame-dot" />
                <span className="frame-dot" />
                <span className="frame-dot" />
              </div>
              <Image
                src="/product/plan-retention.png"
                alt="Plan de rétention TalentPulse : diagnostic, guide d'entretien et simulateur de contre-mesure"
                width={1200}
                height={1600}
                loading="lazy"
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        {/* ========================== FEATURES ========================== */}
        <section className="section border-b border-line">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">Fonctionnalités</p>
              <h2 className="mt-4 text-h2 font-semibold">Ce que fait la plateforme.</h2>
              <p className="mt-4 text-base text-ink-2">
                Six capacités, toutes vérifiées par la suite de tests fournie avec le code.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="bg-surface p-6">
                  <h3 className="text-title font-semibold">{f.title}</h3>
                  <p className="mt-2.5 text-small leading-relaxed text-ink-2">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================== TARIFS =========================== */}
        <section id="tarifs" className="section border-b border-line bg-surface">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow justify-center">Tarifs</p>
              <h2 className="mt-4 text-h2 font-semibold">Un tarif, pas de devis surprise.</h2>
              <p className="mt-4 text-base text-ink-2">
                Sans engagement, résiliable à tout moment. Le dépassement d&apos;effectif ne
                coupe jamais l&apos;accès : il déclenche une conversation.
              </p>

              <div className="mt-8 inline-flex items-center rounded-md border border-line bg-paper p-0.5">
                <button
                  onClick={() => setCycle("monthly")}
                  className={`rounded px-3.5 py-1.5 text-micro font-medium uppercase tracking-[0.08em] transition ${
                    cycle === "monthly" ? "bg-ink text-white" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setCycle("yearly")}
                  className={`rounded px-3.5 py-1.5 text-micro font-medium uppercase tracking-[0.08em] transition ${
                    cycle === "yearly" ? "bg-ink text-white" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  Annuel −20 %
                </button>
              </div>
            </div>

            <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
              {plans.map((plan) => {
                const price = cycle === "monthly" ? plan.monthly : plan.yearly;
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-xl border bg-surface p-7 ${
                      plan.highlighted
                        ? "border-accent-600 shadow-lift"
                        : "border-line shadow-card"
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-2.5 left-7 rounded bg-accent-600 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.09em] text-white">
                        Le plus choisi
                      </span>
                    )}

                    <h3 className="text-title font-semibold">{plan.name}</h3>
                    <p className="mt-1.5 min-h-[36px] text-small leading-relaxed text-ink-3">
                      {plan.audience}
                    </p>

                    <div className="mt-6 border-b border-line pb-6">
                      {price ? (
                        <p className="flex items-baseline gap-1.5">
                          <span className="figure text-[2.25rem] leading-none">{price} €</span>
                          <span className="text-small text-ink-3">/ mois</span>
                        </p>
                      ) : (
                        <p className="text-h3 font-semibold">Sur mesure</p>
                      )}
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-small text-ink-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok-600" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7">
                      {plan.id === "enterprise" ? (
                        <a
                          href="mailto:contact@talentpulse.app?subject=Demande%20de%20devis%20TalentPulse%20Entreprise"
                          className="block"
                        >
                          <Button variant="secondary" size="md" className="w-full">
                            {plan.cta}
                          </Button>
                        </a>
                      ) : (
                        <Link href="/auth/login" className="block">
                          <Button
                            variant={plan.highlighted ? "primary" : "secondary"}
                            size="md"
                            className="w-full"
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================= FAQ ============================= */}
        <section id="faq" className="section border-b border-line">
          <div className="container-page grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-20">
            <div>
              <p className="eyebrow">Questions</p>
              <h2 className="mt-4 text-h2 font-semibold">Ce qu&apos;on nous demande.</h2>
              <p className="mt-4 text-small text-ink-2">
                Une question qui n&apos;est pas ici ?{" "}
                <a
                  href="mailto:contact@talentpulse.app"
                  className="font-medium text-accent-600 underline decoration-accent-200 underline-offset-4 transition hover:text-accent-700"
                >
                  Écrivez-nous
                </a>
                .
              </p>
            </div>

            <dl className="divide-y divide-line border-t border-line">
              {faqs.map((faq) => (
                <div key={faq.q} className="py-6">
                  <dt>
                    <h3 className="text-title font-semibold">{faq.q}</h3>
                  </dt>
                  <dd className="mt-2.5 max-w-prose text-base leading-relaxed text-ink-2">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ========================== FINAL CTA ========================== */}
        <section className="bg-ink py-20 text-white sm:py-28">
          <div className="container-page text-center">
            <h2 className="mx-auto max-w-2xl text-h2 font-semibold text-white">
              Le premier départ évité rembourse l&apos;année.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/60">
              La démonstration contient 14 collaborateurs et 182 prédictions déjà chargées.
              Aucune installation, aucune carte bancaire.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/20 bg-white text-ink hover:border-white hover:bg-white/90 hover:text-ink"
                >
                  Explorer la démo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#video">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <PlayCircle className="h-4 w-4" />
                  Revoir les 30 secondes
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-line bg-paper py-12">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-ink text-white">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
                    <path
                      d="M3 13h3.2l2.1-6.2 3.4 11.4 2.4-7.1 1.6 3.9H21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-small font-semibold">TalentPulse</span>
              </div>
              <p className="mt-3 text-small leading-relaxed text-ink-3">
                Plateforme d&apos;anticipation du turnover. Déployable sur votre infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <div>
                <p className="font-mono text-micro uppercase tracking-[0.09em] text-ink-4">
                  Produit
                </p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="#produit" className="text-small text-ink-2 transition hover:text-ink">
                      Présentation
                    </a>
                  </li>
                  <li>
                    <a href="#video" className="text-small text-ink-2 transition hover:text-ink">
                      Démonstration
                    </a>
                  </li>
                  <li>
                    <a href="#tarifs" className="text-small text-ink-2 transition hover:text-ink">
                      Tarifs
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-mono text-micro uppercase tracking-[0.09em] text-ink-4">
                  Compte
                </p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link
                      href="/auth/login"
                      className="text-small text-ink-2 transition hover:text-ink"
                    >
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/register"
                      className="text-small text-ink-2 transition hover:text-ink"
                    >
                      Créer un compte
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-mono text-micro uppercase tracking-[0.09em] text-ink-4">
                  Contact
                </p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a
                      href="mailto:contact@talentpulse.app"
                      className="text-small text-ink-2 transition hover:text-ink"
                    >
                      contact@talentpulse.app
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-line pt-6 sm:flex-row">
            <p className="font-mono text-micro uppercase text-ink-4">
              TalentPulse © {new Date().getFullYear()} · Licence MIT
            </p>
            <p className="font-mono text-micro uppercase text-ink-4">
              Vos données restent dans votre instance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
