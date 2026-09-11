import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontClassName } from "./fonts";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://talentpulse.app"),
  title: {
    default: "TalentPulse — Savez qui va partir avant qu'il ne démissionne",
    template: "%s · TalentPulse",
  },
  description:
    "TalentPulse note chaque collaborateur de 0 à 100 % à partir de cinq signaux RH (performance, engagement, satisfaction, ancienneté, rémunération) et transforme ce score en plan d'action pour le manager.",
  keywords: [
    "RH",
    "turnover",
    "prédiction",
    "rétention des talents",
    "SaaS RH",
    "people analytics",
    "RandomForest",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "TalentPulse",
    title: "TalentPulse — Savez qui va partir avant qu'il ne démissionne",
    description:
      "Cinq signaux RH, un score de risque par collaborateur, un plan d'action concret pour le manager. Auto-hébergeable, testé de bout en bout.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentPulse — Anticipez le turnover",
    description:
      "Cinq signaux RH, un score de risque par collaborateur, un plan d'action concret pour le manager.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={fontClassName}>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
