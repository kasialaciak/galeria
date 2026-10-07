"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Logo } from "./logo";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/produkty" as const, label: t("products") },
    { href: "/galeria" as const, label: "Galeria prac" },
    { href: "/kontakt" as const, label: t("contact") },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-charcoal hover:text-forest hover:bg-sage/40 transition-colors"
          aria-label="Rozwiń menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-cream border-r border-warm-gray flex flex-col p-6">
        <SheetHeader className="text-left border-b border-warm-gray pb-4">
          <SheetTitle className="font-serif text-2xl font-bold text-forest">
            <Logo size={32} />
          </SheetTitle>
          <p className="text-xs text-charcoal/60">
            Unikatowe, ręcznie tworzone przedmioty
          </p>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-charcoal transition-colors hover:text-forest hover:translate-x-1 duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
