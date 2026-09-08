"use client";

import Link from "next/link";
import { useState } from "react";
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
  Target,
  Check,
  Calculator,
  Activity,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Sliders,
  DollarSign,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/Button";

// FAQ Items
const faqs = [
  {
    q: "Quelles données RH sont nécessaires pour alimenter les prédictions ?",
    a: "TalentPulse se base sur 5 indicateurs simples : le niveau de performance, l'engagement mesuré, le score de satisfaction, l'ancienneté en années et le ratio salarial par rapport au marché. Vous pouvez importer ces données en 1 clic via fichier CSV ou les saisir manuellement.",
  },
  {
    q: "Comment fonctionne l'algorithme de Machine Learning ?",
    a: "Nous utilisons un classifieur RandomForest entraîné sur des cohortes représentatives d'entreprises tech et services. Il corrèle en continu les signaux faibles pour calculer une probabilité de départ (0 à 100 %) sans biais subjectif.",
  },
  {
    q: "Les données de nos collaborateurs sont-elles protégées ?",
    a: "Absolument. Conformément au RGPD, toutes les données sont chiffrées de bout en bout et hébergées sur des serveurs sécurisés en Europe. Aucune donnée nominative n'est utilisée pour entraîner des modèles publics.",
  },
  {
    q: "En combien de temps le retour sur investissement (ROI) est-il atteint ?",
    a: "Dès le premier départ évité. Le coût moyen du remplacement d'un collaborateur clé oscille entre 30 000 € et 50 000 €. Pour une équipe de 80 personnes, TalentPulse coûte moins de 1 200 € par an : le ROI dépasse 2 500 %.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // State pour le simulateur de ROI interactif
  const [headcount, setHeadcount] = useState(75);
  const [avgSalary, setAvgSalary] = useState(52000);
  const [turnoverRate, setTurnoverRate] = useState(14);

  // Calculs du simulateur de ROI
  const estimatedDepartures = Math.max(1, Math.round(headcount * (turnoverRate / 100)));
  const costPerDeparture = Math.round(avgSalary * 0.5); // Règle standard RH : 50% du salaire annuel
  const totalTurnoverCost = estimatedDepartures * costPerDeparture;
  const estimatedSavedDepartures = Math.max(1, Math.round(estimatedDepartures * 0.35)); // 35% de réduction
  const annualSavings = estimatedSavedDepartures * costPerDeparture;
  const talentPulseAnnualCost = headcount <= 50 ? 468 : 1428; // Estimatif Starter vs Pro annuel
  const roiMultiplier = Math.max(1, Math.round(annualSavings / talentPulseAnnualCost));

  // State pour la carte interactive de démonstration du collaborateur
  const [salaryFactor, setSalaryFactor] = useState(0); // -10% à +10%
  const [satisfactionFactor, setSatisfactionFactor] = useState(4.5); // 1 à 10

  // Calcul dynamique du score de risque simulé
  const baseRisk = 0.82;
  const dynamicRisk = Math.min(
    0.95,
    Math.max(
      0.15,
      baseRisk - (salaryFactor * 0.02) - ((satisfactionFactor - 4.5) * 0.08)
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary-500 selection:text-white">
      {/* ===== 1. Navigation Bar ===== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-white shadow-glow transition group-hover:bg-primary-500">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Talent<span className="text-primary-400">Pulse</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#simulateur" className="text-sm font-medium text-slate-400 transition hover:text-white">
              Simulateur ROI
            </a>
            <a href="#diagnostic" className="text-sm font-medium text-slate-400 transition hover:text-white">
              Copilot IA
            </a>
            <a href="#fonctionnalites" className="text-sm font-medium text-slate-400 transition hover:text-white">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm font-medium text-slate-400 transition hover:text-white">
              Tarifs
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-400 transition hover:text-white">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Connexion
            </Link>
            <Link href="/auth/login">
              <Button variant="accent" size="sm" className="shadow-glow">
                Démo live
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:text-white md:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-800 bg-slate-900 px-4 py-6 md:hidden">
            <nav className="flex flex-col gap-4">
              <a
                href="#simulateur"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300"
              >
                Simulateur ROI
              </a>
              <a
                href="#diagnostic"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300"
              >
                Copilot IA
              </a>
              <a
                href="#fonctionnalites"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300"
              >
                Fonctionnalités
              </a>
              <a
                href="#tarifs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300"
              >
                Tarifs
              </a>
              <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-slate-800">
                <Link href="/auth/login" className="w-full">
                  <Button variant="secondary" size="md" className="w-full">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full">
                  <Button variant="accent" size="md" className="w-full">
                    Accéder à la démo live
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* ===== 2. Hero Section ===== */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

          <div className="container-page relative z-10 text-center">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-950/60 px-3.5 py-1 text-xs font-medium text-primary-300 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Machine Learning RH · RandomForest v2 prédictif
            </div>

            {/* Main Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15] text-white">
              Ne subissez plus les démissions clés.{" "}
              <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-primary-500 bg-clip-text text-transparent">
                Anticipez-les avant qu'il ne soit trop tard.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
              TalentPulse analyse les signaux faibles (satisfaction, engagement, salaire, charge)
              et identifie les collaborateurs à risque de départ jusqu'à 3 mois à l'avance, avec
              des plans d'actions concrets pour vos managers.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full sm:w-auto shadow-glow">
                  Essayer la démo interactive
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="#simulateur" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800">
                  <Calculator className="h-4 w-4 mr-2 text-primary-400" />
                  Calculer vos économies
                </Button>
              </a>
            </div>

            {/* Social Proof Strip */}
            <div className="mt-16 border-t border-slate-800/80 pt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
              <div>
                <p className="font-mono text-2xl font-bold text-white">1 400+</p>
                <p className="text-xs text-slate-400 mt-0.5">Talents suivis en continu</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-emerald-400">35 %</p>
                <p className="text-xs text-slate-400 mt-0.5">De turnover évité</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-white">&lt; 5 min</p>
                <p className="text-xs text-slate-400 mt-0.5">Pour importer vos équipes</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-primary-400">100 %</p>
                <p className="text-xs text-slate-400 mt-0.5">RGPD & souveraineté UE</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 3. LIVE INTERACTIVE WIDGET 1 : Simulateur de ROI ===== */}
        <section id="simulateur" className="py-20 border-t border-slate-800/80 bg-slate-900/50">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Simulateur Financier</span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white mt-2">
                Quel est le véritable coût du turnover dans votre entreprise ?
              </h2>
              <p className="text-sm text-slate-400 mt-3">
                Ajustez les curseurs selon la taille de vos équipes pour estimer vos départs annuels
                et les économies directes réalisables avec TalentPulse.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Controls Column */}
              <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Slider 1: Headcount */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-300">Nombre de collaborateurs</span>
                      <span className="font-mono text-base font-bold text-primary-400">{headcount} personnes</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={500}
                      step={5}
                      value={headcount}
                      onChange={(e) => setHeadcount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>20</span>
                      <span>250</span>
                      <span>500</span>
                    </div>
                  </div>

                  {/* Slider 2: Average Salary */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-300">Salaire brut annuel moyen</span>
                      <span className="font-mono text-base font-bold text-primary-400">
                        {avgSalary.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                    <input
                      type="range"
                      min={30000}
                      max={120000}
                      step={2000}
                      value={avgSalary}
                      onChange={(e) => setAvgSalary(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>30 k€</span>
                      <span>75 k€</span>
                      <span>120 k€</span>
                    </div>
                  </div>

                  {/* Slider 3: Turnover rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-300">Taux de turnover annuel estimé</span>
                      <span className="font-mono text-base font-bold text-primary-400">{turnoverRate} %</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={35}
                      step={1}
                      value={turnoverRate}
                      onChange={(e) => setTurnoverRate(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>5 % (Très stable)</span>
                      <span>15 % (Moyenne tech)</span>
                      <span>35 % (Critique)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Calcul basé sur le coût moyen de remplacement (recrutement + onboarding + perte de vélocité = 50% du salaire brut annuel).</span>
                </div>
              </div>

              {/* Results Column */}
              <div className="lg:col-span-6 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-950 via-primary-950/20 to-slate-900 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Impact Financier Estimé
                  </span>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                      <p className="text-xs text-slate-400">Départs subis par an</p>
                      <p className="font-mono text-2xl font-bold text-rose-400 mt-1">
                        ~{estimatedDepartures} pers.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                      <p className="text-xs text-slate-400">Coût annuel subi</p>
                      <p className="font-mono text-2xl font-bold text-slate-200 mt-1">
                        {totalTurnoverCost.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-300">Économies nettes avec TalentPulse</span>
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                        -35% de départs
                      </span>
                    </div>
                    <p className="font-mono text-4xl font-extrabold text-emerald-300 mt-2">
                      +{annualSavings.toLocaleString("fr-FR")} € / an
                    </p>
                    <p className="text-xs text-emerald-400/80 mt-1">
                      Soit {estimatedSavedDepartures} collaborateur(s) clé(s) conservé(s) dans l'équipe.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Multiplicateur de ROI estimé</p>
                    <p className="font-mono text-2xl font-bold text-white">x{roiMultiplier}</p>
                  </div>
                  <Link href="/auth/login">
                    <Button variant="accent" size="sm">
                      Démarrer l'audit
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 4. LIVE INTERACTIVE WIDGET 2 : Le Copilot de Rétention IA ===== */}
        <section id="diagnostic" className="py-20 border-t border-slate-800/80">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Copilot Exécutif IA</span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white mt-2">
                Un diagnostic qui ne se contente pas de prédire : il vous dit quoi faire.
              </h2>
              <p className="text-sm text-slate-400 mt-3">
                Testez en direct l'impact de vos leviers de rétention sur le score de risque d'un collaborateur à risque critique.
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
              {/* Header card */}
              <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-900/60 border border-primary-500/40 flex items-center justify-center font-bold text-primary-300">
                    AD
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Alexandre Dupont</h3>
                    <p className="text-xs text-slate-400">Senior Software Engineer · R&D · Ancienneté : 2.8 ans</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Score de risque :</span>
                  <div className={`px-3 py-1 rounded-full font-mono text-xs font-bold border ${
                    dynamicRisk >= 0.7
                      ? "bg-rose-950/60 text-rose-300 border-rose-500/40"
                      : dynamicRisk >= 0.4
                      ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                      : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                  }`}>
                    {Math.round(dynamicRisk * 100)} % ({dynamicRisk >= 0.7 ? "Critique" : dynamicRisk >= 0.4 ? "Modéré" : "Sous contrôle"})
                  </div>
                </div>
              </div>

              {/* Simulation Interactive Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Levers */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Sliders className="h-4 w-4 text-primary-400" />
                    Leviers d'ajustement du manager
                  </div>

                  {/* Lever 1: Salary adjustment */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-300">Ajustement salarial</span>
                      <span className="font-mono text-xs font-bold text-primary-400">
                        {salaryFactor > 0 ? `+${salaryFactor}%` : salaryFactor < 0 ? `${salaryFactor}%` : "Aucun changement"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-10}
                      max={15}
                      step={1}
                      value={salaryFactor}
                      onChange={(e) => setSalaryFactor(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Simule un réalignement par rapport à la grille de marché.</p>
                  </div>

                  {/* Lever 2: Satisfaction improvement */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-300">Score de satisfaction collaborateur</span>
                      <span className="font-mono text-xs font-bold text-primary-400">{satisfactionFactor} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={10}
                      step={0.5}
                      value={satisfactionFactor}
                      onChange={(e) => setSatisfactionFactor(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Impact d'une réaffectation sur un projet stratégique motivant.</p>
                  </div>
                </div>

                {/* Right: AI Retention Plan */}
                <div className="rounded-xl border border-primary-500/30 bg-primary-950/20 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary-300 uppercase tracking-wider mb-4">
                      <Sparkles className="h-4 w-4 text-primary-400" />
                      Recommandations IA en temps réel
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="rounded-lg border border-slate-800/80 bg-slate-900/90 p-3">
                        <span className="font-semibold text-rose-300 flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                          Facteur racine détecté
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          Écart salarial de -12% vs marché et stagnation de poste depuis 18 mois, combinés à un niveau de performance exceptionnel (9.2/10).
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800/80 bg-slate-900/90 p-3">
                        <span className="font-semibold text-primary-300 flex items-center gap-1.5 mb-1">
                          <Lightbulb className="h-3.5 w-3.5 text-primary-400" />
                          Question clé pour l'entretien 1-to-1
                        </span>
                        <p className="text-slate-300 italic leading-relaxed">
                          « Comment te projettes-tu sur les choix d'architecture du prochain semestre et as-tu le sentiment que tes responsabilités actuelles sont valorisées à leur juste niveau ? »
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Généré avec RandomForest & LLM</span>
                    <span className="text-emerald-400 font-semibold">Prêt pour entretien RH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 5. Features Bento Grid ===== */}
        <section id="fonctionnalites" className="py-20 border-t border-slate-800/80 bg-slate-900/30">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Architecture & Valeur</span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white mt-2">
                Conçu pour les directeurs RH et les comités de direction
              </h2>
              <p className="text-sm text-slate-400 mt-3">
                Une suite complète qui transforme des données RH dispersées en décisions stratégiques de rétention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Card 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-primary-950 border border-primary-500/30 flex items-center justify-center text-primary-400 mb-4">
                    <Brain className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Modèle IA 5-Facteurs</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Corrélation mathématique continue entre performance, engagement, satisfaction, ancienneté et grille salariale.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-primary-400">
                  Précision 91.4% · Zéro hallucination
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Tendance sur 13 Semaines</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Graphiques clairs d'évolution de risque par département pour détecter les surchauffes d'équipes avant la rupture.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-emerald-400">
                  Données consolidées temps réel
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Alertes Proactives</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Notification automatique dès qu'un collaborateur clé franchit un seuil de risque critique (seuil ≥ 70%).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-rose-400">
                  Notification instantanée
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 6. Pricing Section ===== */}
        <section id="tarifs" className="py-20 border-t border-slate-800/80">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Tarification Transparente</span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white mt-2">
                Un investissement rentabilisé dès le premier mois
              </h2>
              <p className="text-sm text-slate-400 mt-3">
                Tarification claire, sans frais cachés, sans engagement.
              </p>

              {/* Billing Toggle */}
              <div className="mt-8 inline-flex items-center rounded-full border border-slate-800 bg-slate-900 p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    billingCycle === "monthly" ? "bg-primary-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    billingCycle === "yearly" ? "bg-primary-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Annuel</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {/* Starter */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Starter</h3>
                  <p className="text-xs text-slate-400 mt-1">Pour les startups et équipes jusqu'à 50 collaborateurs.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold text-white">
                      {billingCycle === "yearly" ? "39 €" : "49 €"}
                    </span>
                    <span className="text-xs text-slate-400">/ mois</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Jusqu'à 50 talents suivis
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Modèle prédictif RandomForest
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Tableau de bord exécutif
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Support par email sous 24h
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <Link href="/auth/login" className="w-full block">
                    <Button variant="secondary" size="md" className="w-full bg-slate-900 border-slate-700 text-slate-200">
                      Commencer en Starter
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pro (Highlighted) */}
              <div className="rounded-2xl border-2 border-primary-500 bg-gradient-to-b from-slate-900 to-slate-950 p-8 flex flex-col justify-between shadow-glow relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  Le plus populaire
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Pro</h3>
                  <p className="text-xs text-slate-400 mt-1">Pour les PME et scale-ups de 50 à 250 collaborateurs.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold text-white">
                      {billingCycle === "yearly" ? "119 €" : "149 €"}
                    </span>
                    <span className="text-xs text-slate-400">/ mois</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Jusqu'à 250 talents suivis
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Copilot de Rétention IA (plans d'action 1-to-1)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Analytics avancés 13 semaines
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Rapports PDF exécutifs Comex
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Support prioritaire dédié
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <Link href="/auth/login" className="w-full block">
                    <Button variant="accent" size="md" className="w-full">
                      Tester gratuitement 14 jours
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Entreprise */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Entreprise</h3>
                  <p className="text-xs text-slate-400 mt-1">Sur-mesure pour les organisations de plus de 250 collaborateurs.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">Sur mesure</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Collaborateurs illimités
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Intégration directe SIRH (Lucca, Workday)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Modèle de Machine Learning calibré sur-mesure
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Account Manager & consultant RH dédié
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <a href="mailto:contact@talentpulse.app" className="w-full block">
                    <Button variant="secondary" size="md" className="w-full bg-slate-900 border-slate-700 text-slate-200">
                      Contacter l'équipe
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 7. FAQ Section ===== */}
        <section id="faq" className="py-20 border-t border-slate-800/80 bg-slate-900/30">
          <div className="container-page max-w-3xl">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Questions Fréquentes</span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white mt-2">
                Tout ce que vous devez savoir
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                  <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 8. Final CTA ===== */}
        <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-primary-950/30 text-center">
          <div className="container-page max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
              Prêt à protéger vos talents stratégiques ?
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Connectez-vous en 30 secondes à la démo live avec 14 collaborateurs et 182 prédictions pré-chargées.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/auth/login">
                <Button size="lg" variant="accent" className="shadow-glow px-8">
                  Lancer la démo TalentPulse
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===== 9. Footer ===== */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-500">
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary-600 flex items-center justify-center font-bold text-white text-xs">
              TP
            </div>
            <span className="font-semibold text-slate-300">TalentPulse © 2026</span>
            <span>— Plateforme d'anticipation du turnover et d'intelligence RH.</span>
          </div>

          <div className="flex gap-6">
            <Link href="/auth/login" className="hover:text-slate-300 transition">
              Connexion Démo
            </Link>
            <a href="mailto:contact@talentpulse.app" className="hover:text-slate-300 transition">
              Support
            </a>
            <span className="text-slate-600">Hébergé en Europe (RGPD)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
