import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TalentPulse — Anticipez le turnover de vos talents",
    template: "%s · TalentPulse",
  },
  description:
    "La plateforme SaaS qui prédit le turnover de vos collaborateurs grâce au machine learning, pour agir avant qu'il ne soit trop tard.",
  keywords: ["RH", "turnover", "prédiction", "talent", "SaaS", "machine learning"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${sans.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
