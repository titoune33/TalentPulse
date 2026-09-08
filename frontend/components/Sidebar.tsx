"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
  CreditCard,
  Zap,
  Brain,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Tableau bord", icon: LayoutDashboard, roles: [] },
  { href: "/talents", label: "Talents", icon: Users, roles: [] },
  { href: "/predictions", label: "Prédictions", icon: Sparkles, roles: [] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "hr_manager"] },
  { href: "/reports", label: "Rapports", icon: FileText, roles: ["admin", "hr_manager"] },
];

const secondary = [
  { href: "/billing", label: "Abonnement", icon: CreditCard, roles: [] },
  { href: "/settings", label: "Paramètres", icon: Settings, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasAnyRole } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const itemCls = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
      isActive(href)
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
    }`;

  const visibleNav = nav.filter((item) => item.roles.length === 0 || hasAnyRole(item.roles));
  const visibleSecondary = secondary.filter((item) => item.roles.length === 0 || hasAnyRole(item.roles));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-slate-200/80 bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <Brain className="h-5 w-5 text-primary-400" />
        </div>
        <div>
          <p className="text-base font-extrabold tracking-tight text-slate-900">TalentPulse</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Modèle ML Actif
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Principal
        </p>
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={itemCls(item.href)}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}

        <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Pilotage
        </p>
        {visibleSecondary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={itemCls(item.href)}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
            {(user?.name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {user?.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.role === "admin" ? "Administrateur" : user?.role === "hr_manager" ? "RH Manager" : "Employé"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
