"use client";

import { useEffect, useState } from "react";
import { Heart, ShoppingBag, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/routing";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { LocaleSwitcher } from "./locale-switcher";
import { CartDrawer } from "./cart-drawer";
import { useCart } from "@/hooks/use-cart";

type HeaderProps = {
  storeEnabled?: boolean;
};

export function Header({ storeEnabled = true }: HeaderProps) {
  const t = useTranslations("Nav");
  const { totalItems, setIsOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isGalleryPage = pathname === "/" || pathname === "/pl" || pathname === "/en";

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? totalItems() : 0;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-warm-gray bg-white/95 backdrop-blur-md transition-all shadow-xs">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LEWA STRONA: Hamburger menu */}
          <div className="flex items-center gap-3">
            <MobileMenu storeEnabled={storeEnabled} isGalleryPage={isGalleryPage} />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {storeEnabled && !isGalleryPage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-charcoal hover:text-clay hover:bg-sage/40 transition-colors"
                  asChild
                >
                  <Link href="/lista-zyczen" aria-label={t("wishlist")}>
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-charcoal hover:text-forest hover:bg-sage/40 transition-colors"
                  onClick={() => setIsOpen(true)}
                  aria-label={t("cart")}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-clay px-1 text-[11px] font-bold text-white shadow-xs animate-in zoom-in-50">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </>
            )}

            {!isGalleryPage && (<Button variant="ghost" size="icon" className="text-charcoal hover:text-forest hover:bg-sage/40 transition-colors" asChild><Link href="/konto" aria-label={t("account")}><User className="h-5 w-5" /></Link></Button>)}

            <div className="ml-2 pl-2 border-l border-warm-gray">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}


