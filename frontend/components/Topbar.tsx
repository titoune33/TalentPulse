"use client";

import { useState } from "react";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/talents": "Talents",
  "/predictions": "Prédictions",
  "/analytics": "Analytics",
  "/reports": "Rapports",
  "/billing": "Abonnement",
  "/settings": "Paramètres",
};

const mobileNav = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/talents", label: "Talents" },
  { href: "/predictions", label: "Prédictions" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reports", label: "Rapports" },
  { href: "/billing", label: "Abonnement" },
  { href: "/settings", label: "Paramètres" },
];

export function Topbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="flex h-[60px] items-center justify-between gap-4 px-5 sm:px-8">
        {/* Left: mobile menu + page title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="-ml-1 rounded-md p-1.5 text-ink-2 transition hover:bg-sunken lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
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
          </Link>

          <h1 className="truncate text-small font-medium text-ink-2">
            {titles[pathname] ?? "TalentPulse"}
          </h1>
        </div>

        {/* Right: account */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition hover:bg-sunken"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-white">
              {(user?.name || "?").charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[13px] font-medium leading-tight text-ink">
                {user?.name ?? "—"}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 z-20 mt-2 w-56 animate-scaleIn overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-float">
                <div className="border-b border-line px-4 py-2.5">
                  <p className="text-[13px] font-medium text-ink">{user?.name ?? "—"}</p>
                  <p className="truncate font-mono text-[11px] text-ink-3">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-small text-danger-600 transition hover:bg-danger-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <nav className="animate-fadeIn border-t border-line bg-surface px-3 py-2 lg:hidden">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-small transition ${
                pathname === item.href
                  ? "bg-sunken font-medium text-ink"
                  : "text-ink-2 hover:bg-sunken/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
