"use client";

import { useTranslations } from "next-intl";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations("Cart");
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } =
    useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-6 bg-white">
        <SheetHeader className="border-b border-warm-gray pb-4">
          <SheetTitle className="flex items-center gap-2 font-serif text-xl font-bold text-forest">
            <ShoppingBag className="h-5 w-5 text-forest" />
            {t("title")} ({items.reduce((s, i) => s + i.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-sage/50 flex items-center justify-center text-forest">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <p className="text-charcoal/70 font-medium">{t("empty")}</p>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="text-forest border-forest hover:bg-forest hover:text-white"
            >
              {t("continueShopping")}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4 divide-y divide-warm-gray/60">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 pt-4 first:pt-0">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-cream shrink-0 border border-warm-gray">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal/30 text-xs">
                        Foto
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal truncate">
                        {item.name}
                      </h4>
                      {item.variantLabel && (
                        <p className="text-xs text-charcoal/60">
                          {item.variantLabel}
                        </p>
                      )}
                      <p className="text-sm font-medium text-forest mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-warm-gray rounded-md bg-cream text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="px-2 py-1 text-charcoal hover:text-forest"
                        >
                          -
                        </button>
                        <span className="px-2 font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="px-2 py-1 text-charcoal hover:text-forest"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-charcoal/40 hover:text-red-500 transition-colors"
                        title={t("remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t border-warm-gray pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-base font-semibold text-charcoal">
                <span>{t("total")}:</span>
                <span className="text-lg font-serif text-forest">
                  {formatPrice(totalPrice())}
                </span>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button
                  className="w-full bg-forest hover:bg-forest/90 text-white font-medium"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/zamowienie" className="flex items-center justify-center gap-2">
                    {t("checkout")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs text-charcoal/70"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/koszyk">{t("goToCart")}</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
