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
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/talents", label: "Talents", icon: Users },
  { href: "/predictions", label: "Prédictions", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Rapports", icon: FileText },
];

const secondary = [
  { href: "/billing", label: "Abonnement", icon: CreditCard },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const itemCls = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-primary-600 text-white shadow-sm"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-extrabold text-white">TalentPulse</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            RH Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Pilotage
        </p>
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className={itemCls(item.href)}>
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Compte
        </p>
        {secondary.map((item) => (
          <Link key={item.href} href={item.href} className={itemCls(item.href)}>
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs font-semibold text-white">Plan Pro</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Prédictions illimitées
          </p>
        </div>
      </div>
    </aside>
  );
}
