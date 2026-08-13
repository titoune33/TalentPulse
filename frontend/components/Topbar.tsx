"use client";

import { useState } from "react";
import { LogOut, Menu, X, ChevronDown, Brain } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/talents": "Gestion des talents",
  "/predictions": "Prédictions de turnover",
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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "TP";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      {/* Mobile: logo + hamburger */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Brain className="h-4 w-4" />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <h1 className="hidden text-lg font-bold text-slate-900 sm:block lg:ml-64">
        {titles[pathname] ?? "TalentPulse"}
      </h1>
      <div className="hidden lg:block" />

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="absolute inset-x-0 top-16 z-30 border-b border-slate-200 bg-white p-3 shadow-lg lg:hidden">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                pathname === item.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-800">
              {user?.name ?? "—"}
            </p>
            <p className="text-[11px] leading-tight text-slate-400">
              {user?.email ?? ""}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name ?? "—"}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
