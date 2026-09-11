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
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Tableau bord", icon: LayoutDashboard, roles: [] as string[] },
  { href: "/talents", label: "Talents", icon: Users, roles: [] },
  { href: "/predictions", label: "Prédictions", icon: Sparkles, roles: [] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "hr_manager"] },
  { href: "/reports", label: "Rapports", icon: FileText, roles: ["admin", "hr_manager"] },
];

const secondary = [
  { href: "/billing", label: "Abonnement", icon: CreditCard, roles: [] as string[] },
  { href: "/settings", label: "Paramètres", icon: Settings, roles: ["admin"] },
];

const roleLabel: Record<string, string> = {
  admin: "Administrateur",
  hr_manager: "Responsable RH",
  employee: "Collaborateur",
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasAnyRole } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const itemCls = (href: string) =>
    `group relative flex items-center gap-3 rounded-md px-3 py-2 text-small transition-colors ${
      isActive(href)
        ? "bg-sunken font-medium text-ink"
        : "text-ink-2 hover:bg-sunken/70 hover:text-ink"
    }`;

  const visibleNav = nav.filter((item) => item.roles.length === 0 || hasAnyRole(item.roles));
  const visibleSecondary = secondary.filter((item) => item.roles.length === 0 || hasAnyRole(item.roles));

  const Group = ({ items }: { items: typeof nav }) => (
    <div className="space-y-0.5">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={itemCls(item.href)}>
          {isActive(item.href) && (
            <span className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-accent-600" aria-hidden />
          )}
          <item.icon
            className={`h-4 w-4 shrink-0 ${isActive(item.href) ? "text-accent-600" : "text-ink-3 group-hover:text-ink-2"}`}
          />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-surface lg:flex">
      {/* Wordmark */}
      <div className="flex h-[60px] items-center gap-2.5 border-b border-line px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
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
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Talent<span className="text-ink-3">Pulse</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 font-mono text-micro uppercase text-ink-4">Principal</p>
        <Group items={visibleNav} />

        <p className="px-3 pb-2 pt-6 font-mono text-micro uppercase text-ink-4">Pilotage</p>
        <Group items={visibleSecondary} />
      </nav>

      {/* Model status + account */}
      <div className="border-t border-line px-3 py-3">
        <div className="mb-2 flex items-center gap-2 rounded-md bg-sunken px-3 py-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok-600" />
          </span>
          <span className="font-mono text-micro uppercase text-ink-3">Modèle actif</span>
        </div>

        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-white">
            {(user?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-tight text-ink">{user?.name}</p>
            <p className="truncate text-[11px] leading-tight text-ink-3">
              {roleLabel[user?.role ?? ""] ?? ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
