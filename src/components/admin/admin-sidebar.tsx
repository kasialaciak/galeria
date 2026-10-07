"use client";

import { usePathname, Link } from "@/i18n/routing";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sliders,
  ExternalLink,
  Store,
  Settings,
  Star,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin" as const,
      label: "Pulpit i Statystyki",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/produkty" as const,
      label: "Produkty",
      icon: Package,
    },
    {
      href: "/admin/kategorie" as const,
      label: "Kategorie",
      icon: Layers,
    },
    {
      href: "/admin/zamowienia" as const,
      label: "Zamówienia",
      icon: ShoppingBag,
    },
    {
      href: "/admin/opinie" as const,
      label: "Opinie klientów",
      icon: Star,
    },
    {
      href: "/admin/gallery" as const,
      label: "Galeria prac",
      icon: ExternalLink,
    },
    {
      href: "/admin/strona-glowna" as const,
      label: "Treść Strony Głównej",
      icon: Sliders,
    },
    {
      href: "/admin/ustawienia" as const,
      label: "Ustawienia sklepu",
      icon: Settings,
    },
    {
      href: "/admin/ustawienia/kupony" as const,
      label: "Kupony",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-warm-gray shrink-0 min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div className="px-3 py-2 border-b border-warm-gray/60">
          <div className="flex items-center gap-2 text-forest font-serif font-bold text-lg">
            <Store className="h-5 w-5" />
            <span>Panel Admina</span>
          </div>
          <p className="text-[11px] text-charcoal/50 mt-0.5">
            Zarządzanie sklepem rękodzieła
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-forest text-white shadow-xs font-semibold"
                    : "text-charcoal/70 hover:text-forest hover:bg-sage/30"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-warm-gray/60">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-charcoal/60 hover:text-forest hover:bg-sage/20 transition-colors"
        >
          <span>Wróć do sklepu</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
