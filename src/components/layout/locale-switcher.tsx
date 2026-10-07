"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "pl" | "en") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-0.5 text-xs font-semibold tracking-wider">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLocale("pl")}
        className={`h-7 px-2 py-0 text-xs rounded ${
          currentLocale === "pl"
            ? "bg-sage font-bold text-forest"
            : "text-charcoal/50 hover:text-charcoal"
        }`}
      >
        PL
      </Button>
      <span className="text-warm-gray select-none">/</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLocale("en")}
        className={`h-7 px-2 py-0 text-xs rounded ${
          currentLocale === "en"
            ? "bg-sage font-bold text-forest"
            : "text-charcoal/50 hover:text-charcoal"
        }`}
      >
        EN
      </Button>
    </div>
  );
}
