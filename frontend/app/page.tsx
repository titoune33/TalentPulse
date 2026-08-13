"use client";

import Link from "next/link";
import {
  Brain,
  BellRing,
  Users,
  FileText,
  ShieldCheck,
  TrendingDown,
  LineChart,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Quote,
  Activity,
  HeartPulse,
  Target,
  Check,
  Play,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "Prédiction IA du turnover",
    text: "Notre modèle RandomForest analyse 5 indicateurs clés pour détecter les départs avant qu'ils ne se produisent.",
    gradient: "from-indigo-50 to-violet-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: LineChart,
    title: "Analytics temps réel",
    text: "Suivez l'évolution du risque par département, équipe ou profil avec des graphiques clairs.",
    gradient: "from-emerald-50 to-cyan-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: BellRing,
    title: "Alertes automatiques",
    text: "Soyez notifié dès qu'un collaborateur franchit un seuil de risque critique. Agenouillez en 15 jours.",
    gradient: "from-amber-50 to-orange-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Users,
    title: "Gestion centralisée",
    text: "Une base unifiée de tous vos collaborateurs : poste, salaire, compétences, historique.",
    gradient: "from-blue-50 to-indigo-50",
    iconColor: "text-blue-600",
  },
  {
    icon: FileText,
    title: "Rapports exécutifs",
    text: "Générez des rapports prêts à présenter à la direction avec priorités et recommandations.",
    gradient: "from-purple-50 to-fuchsia-50",
    iconColor: "text-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & conformité",
    text: "Données chiffrées, accès contrôlé et hébergement sécurisé en Europe.",
    gradient: "from-rose-50 to-pink-50",
    iconColor: "text-rose-600",
  },
];

const steps = [
  {
    icon: Users,
    title: "Importez vos équipes",
    text: "Ajoutez vos collaborateurs manuellement ou via l'API. Les données RH sont structurées en quelques minutes.",
    gradient: "from-indigo-50 to-violet-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: Sparkles,
    title: "Laissez l'IA analyser",
    text: "Notre modèle calcule pour chaque talent un score de risque de 0 à 100 %, en continu.",
    gradient: "from-emerald-50 to-cyan-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Target,
    title: "Agissez avant le départ",
    text: "Recevez des recommandations personnalisées pour réduire votre turnover jusqu'à 35 %.",
    gradient: "from-amber-50 to-orange-50",
    iconColor: "text-amber-600",
  },
];

const testimonials = [
  {
    name: "Sophie Martin",
    role: "DRH, Nova Tech",
    quote: "TalentPulse a détecté un risque de départ chez notre lead engineer deux mois à l'avance. Nous avons pu réagir. Un vrai game changer.",
    initials: "SM",
  },
  {
    name: "Karim Benali",
    role: "People Ops, ScaleUp+",
    quote: "En six mois, notre turnover est passé de 22 % à 14 %. Les alertes automatiques nous font gagner des semaines de réaction.",
    initials: "KB",
  },
  {
    name: "Claire Dubois",
    role: "HR Director, Fintech",
    quote: "Le rapport exécutif est bluffant. Je présente les risques de mes équipes en une diapositive, avec des données solides.",
    initials: "CD",
  },
];

const plans = [
  {
    name: "Starter",
    price: "29€",
    period: "/ mois",
    description: "Pour les petites équipes RH",
    features: [
      "Jusqu'à 50 talents",
      "Prédictions de turnover",
      "Tableau de bord",
      "Support par email",
    ],
    cta: "Commencer",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "79€",
    period: "/ mois",
    description: "Pour les équipes en croissance",
    features: [
      "Jusqu'à 500 talents",
      "Prédictions illimitées",
      "Analytics avancés",
      "Rapports exportables",
      "Support prioritaire",
    ],
    cta: "Essayer gratuitement",
    highlighted: true,
  },
  {
    name: "Entreprise",
    price: "Sur mesure",
    period: "",
    description: "Pour les grands comptes",
    features: [
      "Talents illimités",
      "SSO & rôles avancées",
      "API dédiée",
      "Accompagnement dédié",
    ],
    cta: "Nous contacter",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "Comment fonctionne la prédiction de turnover ?",
    a: "Notre modèle de machine learning analyse cinq indicateurs pour chaque collaborateur : performance, engagement, satisfaction, années d'expérience et rémunération. Il calcule un score de risque de départ de 0 à 100 %, mis à jour à chaque nouvelle donnée.",
  },
  {
    q: "Mes données RH sont-elles en sécurité ?",
    a: "Oui. Vos données sont chiffrées en transit et au repos, accessibles uniquement par les utilisateurs autorisés de votre organisation. Nous ne revendons jamais vos données.",
  },
  {
    q: "Puis-je importer mes données existantes ?",
    a: "Absolument. Vous pouvez ajouter vos collaborateurs via l'interface ou via notre API REST. Un import CSV est disponible.",
  },
  {
    q: "Faut-il installer un logiciel ?",
    a: "Non, TalentPulse est 100 % SaaS. Vous vous connectez depuis votre navigateur, sur ordinateur comme sur mobile. Aucune installation requise.",
  },
  {
    q: "Puis-je tester avant de payer ?",
    a: "Oui ! Créez un compte gratuit ou explorez la démo avec des données d'exemple pour découvrir toutes les fonctionnalités sans engagement.",
  },
];

const trustLogos = [
  { name: "NovaTech", icon: "NT" },
  { name: "ScaleUp+", icon: "SU" },
  { name: "Finora", icon: "FO" },
  { name: "GreenLeaf", icon: "GL" },
  { name: "MediCo", icon: "MC" },
  { name: "Buildr", icon: "BR" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <nav className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">TalentPulse</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Fonctionnalités</a>
            <a href="#how" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Comment ça marche</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Tarifs</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Se connecter
            </Link>
            <Link href="/auth/register" className="btn-primary h-10 px-5">
              Essayer gratuitement
            </Link>
          </div>

          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {[["#features", "Fonctionnalités"], ["#how", "Comment ça marche"], ["#pricing", "Tarifs"], ["#faq", "FAQ"]].map(([href, label]) => (
                <a
                  key={String(href)}
                  href={String(href)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {label}
                </a>
              ))}
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="btn-primary mt-2 justify-center"
              >
                Essayer gratuitement
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 lg:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet-200/20 rounded-full blur-3xl" />
        </div>
        <div className="container-page relative mx-auto grid items-center gap-12 lg:grid-cols-2 lg:py-12">
          <div className="animate-fadeUp">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>IA prédictive pour le turnover</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Anticipez le départ de vos talents
              <span className="block text-indigo-600">
                avant qu'il ne soit trop tard
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              TalentPulse analyse vos données RH avec le machine learning pour identifier 
              les collaborateurs à risque de turnover — et vous donne les actions concrètes 
              pour les retenir.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/auth/register" className="btn-primary h-12 px-7 text-base">
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="btn h-12 border border-slate-300 bg-slate-50 px-7 text-base text-slate-700 hover:bg-slate-100"
              >
                Voir la démo
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { icon: TrendingDown, value: "−35 %", label: "de turnover en 6 mois" },
                { icon: HeartPulse, value: "92 %", label: "de précision du modèle" },
                { icon: Activity, value: "15 j", label: "d'avance sur les départs" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5">
                    <s.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="relative animate-fadeUp [animation-delay:150ms]">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-600/5 to-violet-600/5" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-medium text-slate-400">
                  app.talentpulse.app/dashboard
                </span>
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Tableau de bord</p>
                    <p className="text-xs text-slate-400">Vue d'ensemble des risques</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                    ● Système actif
                  </span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Talents", value: "248", tone: "text-slate-900" },
                    { label: "À risque", value: "17", tone: "text-red-600" },
                    { label: "Risque moyen", value: "38%", tone: "text-amber-600" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl bg-slate-50 p-3">
                      <p className={`text-lg font-extrabold ${kpi.tone}`}>{kpi.value}</p>
                      <p className="text-[11px] text-slate-400">{kpi.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: "Hugo Petit", role: "DevOps Engineer", risk: 97, color: "bg-red-500" },
                    { name: "Emma Garcia", role: "Cheffe de produit", risk: 74, color: "bg-amber-500" },
                    { name: "Léa Bernard", role: "Data Scientist", risk: 84, color: "bg-amber-500" },
                    { name: "Camille Rousseau", role: "Lead Full-Stack", risk: 6, color: "bg-emerald-500" },
                  ].map((t) => (
                    <div key={t.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {t.name.split(" ").map((p) => p[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                        <p className="text-[11px] text-slate-400">{t.role}</p>
                      </div>
                      <div className="w-20">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.risk}%` }} />
                        </div>
                      </div>
                      <span className="w-9 text-right text-xs font-bold text-slate-700">{t.risk}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST LOGOS ===== */}
      <section className="border-t border-slate-100 py-8">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Ils font confiance à TalentPulse
          </span>
          {trustLogos.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                {logo.icon}
              </div>
              <span className="text-sm font-semibold text-slate-600">{logo.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Fonctionnalités
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tout ce qu'il faut pour fidéliser vos talents
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Une plateforme complète qui transforme vos données RH en décisions d'action.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border border-slate-200 bg-gradient-to-br ${f.gradient} p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="mb-5 inline-flex rounded-xl bg-white p-3 shadow-sm">
                  <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="bg-slate-50 py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Comment ça marche
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Trois étapes vers zéro départ surprise
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-8">
                <span className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <div className={`mb-4 mt-2 inline-flex rounded-xl bg-white p-3 shadow-sm`}>
                  <s.icon className={`h-6 w-6 ${s.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ML BAND ===== */}
      <section className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                La science derrière TalentPulse
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Un modèle ML qui apprend de vos équipes
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Notre RandomForest combine cinq signaux pour chaque collaborateur.
                Plus vos données sont riches, plus les prédictions deviennent précises.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                {[
                  { icon: Target, label: "Performance", desc: "Qualité du travail évaluée" },
                  { icon: HeartPulse, label: "Engagement", desc: "Implication au quotidien" },
                  { icon: Activity, label: "Satisfaction", desc: "Bien-être au poste" },
                  { icon: TrendingDown, label: "Salaire & expérience", desc: "Contexte de marché" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="rounded-lg bg-indigo-50 p-2.5">
                      <f.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{f.label}</p>
                      <p className="text-xs text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  Exemple de sortie du modèle
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Performance", value: 0.55, color: "bg-indigo-500" },
                    { label: "Engagement", value: 0.28, color: "bg-violet-500" },
                    { label: "Satisfaction", value: 0.35, color: "bg-emerald-500" },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="font-medium text-slate-600">{bar.label}</span>
                        <span className="font-bold text-slate-900">{Math.round(bar.value * 100)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.value * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold text-red-700">Score de risque estimé</p>
                    <p className="mt-1 text-3xl font-extrabold text-red-600">84 %</p>
                    <p className="mt-1 text-xs text-red-700/80">
                      Risque élevé — entretien individuel recommandé sous 15 jours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="bg-slate-50 py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Témoignages
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ils ont réduit leur turnover
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7">
                <Quote className="h-7 w-7 text-slate-200" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                  « {t.quote} »
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Tarifs
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Un prix simple, sans surprise
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Commencez gratuitement. Passez au niveau supérieur quand vos équipes grandissent.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border bg-white p-8 ${
                  plan.highlighted
                    ? "border-indigo-500 shadow-xl ring-1 ring-indigo-500/20"
                    : "border-slate-200"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Recommandé
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span
                        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${
                          plan.highlighted ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`mt-8 w-full ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="bg-slate-50 py-24">
        <div className="container-page max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Questions fréquentes
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="text-sm font-bold text-slate-900">{f.q}</span>
                  <span
                    className={`text-indigo-600 transition-transform ${openFaq === i ? "rotate-45" : ""}`}
                  >
                    <span className="text-xl leading-none">+</span>
                  </span>
                </button>
                {openFaq === i && (
                  <p className="border-t border-slate-100 px-6 py-4 text-sm leading-relaxed text-slate-600">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-4xl rounded-3xl border border-indigo-200 bg-gradient-to-tr from-indigo-600 to-violet-600 px-8 py-16 text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Prêt à retenir vos meilleurs talents ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
              Rejoignez plus de 1 200 équipes RH qui anticipent les départs avec TalentPulse. 
              Gratuit pour commencer.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="btn-secondary h-12 px-8 text-base">
                Créer un compte gratuit
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="btn h-12 border border-white/20 bg-white/10 px-8 text-base text-white hover:bg-white/15"
              >
                Explorer la démo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-slate-300">
        <div className="container-page">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Brain className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-white">TalentPulse</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#how" className="text-slate-400 hover:text-white transition-colors">Comment ça marche</a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Tarifs</a>
              <a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a>
              <a href="/legal" className="text-slate-400 hover:text-white transition-colors">Mentions légales</a>
              <a href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 md:flex-row">
            <p>© {new Date().getFullYear()} TalentPulse. Tous droits réservés.</p>
            <p className="flex items-center gap-1">Fait avec 💜 pour les équipes RH</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
