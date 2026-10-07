"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const t = useTranslations("Cart");
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } =
    useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="h-8 w-40 bg-warm-gray/50 rounded-md mx-auto mb-4 animate-pulse" />
        <div className="h-64 bg-white rounded-xl border border-warm-gray animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-sage/40 rounded-full flex items-center justify-center mx-auto text-forest mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest mb-3">
          {t("title")}
        </h1>
        <p className="text-charcoal/70 mb-8 max-w-sm mx-auto">
          {t("empty")}
        </p>
        <Button size="lg" asChild className="bg-forest hover:bg-forest/90 text-white font-medium">
          <Link href="/produkty">
            {t("continueShopping")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-warm-gray">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            {t("title")}
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Masz {totalItems()} {totalItems() === 1 ? "przedmiot" : "przedmiotów"} w koszyku
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-xs text-charcoal/50 hover:text-red-600 hover:bg-red-50"
        >
          Wyczyść koszyk
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Lista produktów w koszyku */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="overflow-hidden bg-white border border-warm-gray shadow-xs">
              <CardContent className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-center">
                <Link
                  href={`/produkty/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-cream shrink-0 border border-warm-gray"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-charcoal/40">
                      Rękodzieło
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/produkty/${item.slug}`}>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-charcoal hover:text-forest transition-colors truncate">
                      {item.name}
                    </h3>
                  </Link>

                  {item.variantLabel && (
                    <p className="text-xs text-teal font-medium mt-0.5">
                      {item.variantLabel}
                    </p>
                  )}

                  <p className="font-serif text-base sm:text-lg font-bold text-forest mt-1">
                    {formatPrice(item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-gray/50">
                    {/* Zmiana ilości */}
                    <div className="flex items-center border border-warm-gray rounded-md bg-cream text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="px-2.5 py-1 text-charcoal hover:text-forest cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="px-2.5 py-1 text-charcoal hover:text-forest cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="flex items-center gap-1 text-xs text-charcoal/50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t("remove")}</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="pt-4">
            <Link
              href="/produkty"
              className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal/70 hover:text-forest transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("continueShopping")}</span>
            </Link>
          </div>
        </div>

        {/* Podsumowanie i przycisk Zamów */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-warm-gray shadow-sm sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h2 className="font-serif text-xl font-bold text-forest border-b border-warm-gray pb-3">
                Podsumowanie
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-charcoal/70">
                  <span>Wartość produktów:</span>
                  <span className="font-medium text-charcoal">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
                <div className="flex justify-between text-charcoal/70">
                  <span>Dostawa:</span>
                  <span className="text-xs text-forest font-semibold">
                    Obliczana przy kasie
                  </span>
                </div>
                <div className="pt-3 border-t border-warm-gray flex justify-between items-baseline">
                  <span className="font-serif text-lg font-bold text-charcoal">
                    {t("total")}:
                  </span>
                  <span className="font-serif text-2xl font-bold text-forest">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full bg-forest hover:bg-forest/90 text-white font-medium shadow-md h-12 text-base"
              >
                <Link href="/zamowienie" className="flex items-center justify-center gap-2">
                  <span>{t("checkout")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <div className="text-center">
                <p className="text-[11px] text-charcoal/50 leading-relaxed">
                  Bezpieczna płatność przez Stripe. Rękodzieło tworzone na zamówienie.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
