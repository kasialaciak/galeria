"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { createCheckoutSession } from "@/actions/checkout";
import { validateCouponCode } from "@/actions/cart-coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Truck, Package, Store, Lock, ShoppingBag, ArrowLeft, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckoutClientFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function CheckoutClientForm({ user }: CheckoutClientFormProps) {
  const t = useTranslations("Checkout");
  const { items, totalPrice, clearCart } = useCart();
  const [shippingMethod, setShippingMethod] = useState<"kurier" | "paczkomat" | "odbior">("paczkomat");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discountCents: number; type: string; value: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const shippingCost = shippingMethod === "kurier" ? 1500 : shippingMethod === "paczkomat" ? 1200 : 0;
  
  const subtotal = totalPrice();
  
  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    
    setValidatingCoupon(true);
    try {
      const res = await validateCouponCode(couponCode, subtotal);
      if (res.success && res.coupon) {
        setActiveCoupon(res.coupon);
        setCouponCode("");
        toast.success("Kupon dodany!");
      } else {
        setCouponError(res.error || "Błąd przy weryfikacji kuponu");
        setActiveCoupon(null);
      }
    } catch (e) {
      setCouponError("Błąd serwera");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponError("");
  };

  // Recalculate discount based on subtotal (in case cart changes)
  let currentDiscount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === "percent") {
      currentDiscount = Math.floor(subtotal * (activeCoupon.value / 100));
    } else {
      currentDiscount = activeCoupon.value;
    }
    currentDiscount = Math.min(currentDiscount, subtotal); // nie więcej niż koszyk
  }

  const grandTotal = subtotal - currentDiscount + shippingCost;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-warm-gray p-8">
        <ShoppingBag className="h-10 w-10 mx-auto text-charcoal/30 mb-3" />
        <h2 className="font-serif text-2xl font-bold text-forest mb-2">Twój koszyk jest pusty</h2>
        <p className="text-sm text-charcoal/60 mb-6">Dodaj produkty do koszyka, aby przejść do kasy.</p>
        <Button asChild className="bg-forest hover:bg-forest/90 text-white">
          <Link href="/produkty">Wróć do sklepu</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      toast.error("Musisz zaakceptować regulamin, aby złożyć zamówienie.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("shippingMethod", shippingMethod);
    if (activeCoupon) {
      formData.set("couponCode", activeCoupon.code);
    }

    const cartInput = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    startTransition(async () => {
      const res = await createCheckoutSession(formData, cartInput);

      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
        return;
      }

      if (res?.checkoutUrl) {
        clearCart();
        window.location.href = res.checkoutUrl;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        <Card className="bg-white border-warm-gray shadow-xs">
          <CardHeader className="border-b border-warm-gray pb-4">
            <CardTitle className="font-serif text-xl font-bold text-forest flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-xs text-white">
                1
              </span>
              {t("shippingDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="shippingName" className="text-xs font-semibold text-charcoal">
                {t("name")} *
              </label>
              <Input
                id="shippingName"
                name="shippingName"
                defaultValue={user.name || ""}
                required
                placeholder="Jan Kowalski"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="shippingEmail" className="text-xs font-semibold text-charcoal">
                  Email *
                </label>
                <Input
                  id="shippingEmail"
                  name="shippingEmail"
                  type="email"
                  defaultValue={user.email || ""}
                  required
                  placeholder="jan@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="shippingPhone" className="text-xs font-semibold text-charcoal">
                  Telefon *
                </label>
                <Input
                  id="shippingPhone"
                  name="shippingPhone"
                  type="tel"
                  required
                  placeholder="np. 500 123 456"
                />
              </div>
            </div>

            {shippingMethod === "odbior" ? (
              <div className="p-3 bg-sage/10 rounded-lg border border-forest/20 text-xs text-charcoal/80">
                Wybrano odbiór osobisty – adres dostawy nie jest wymagany.
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="shippingAddress" className="text-xs font-semibold text-charcoal">
                    {t("address")} *
                  </label>
                  <Input
                    id="shippingAddress"
                    name="shippingAddress"
                    required
                    placeholder="ul. Kwiatowa 12/4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="shippingPostalCode" className="text-xs font-semibold text-charcoal">
                      {t("postalCode")} *
                    </label>
                    <Input
                      id="shippingPostalCode"
                      name="shippingPostalCode"
                      required
                      placeholder="00-001"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="shippingCity" className="text-xs font-semibold text-charcoal">
                      {t("city")} *
                    </label>
                    <Input
                      id="shippingCity"
                      name="shippingCity"
                      required
                      placeholder="Warszawa"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-1.5 pt-2">
              <label htmlFor="customerNotes" className="text-xs font-semibold text-charcoal">
                Uwagi do zamówienia (opcjonalnie)
              </label>
              <textarea
                id="customerNotes"
                name="customerNotes"
                rows={3}
                className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-sm placeholder:text-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50"
                placeholder="Napisz jeśli masz specjalne życzenia co do kolorów lub detali..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Metoda dostawy */}
        <Card className="bg-white border-warm-gray shadow-xs">
          <CardHeader className="border-b border-warm-gray pb-4">
            <CardTitle className="font-serif text-xl font-bold text-forest flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-xs text-white">
                2
              </span>
              {t("shippingMethod")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {/* Paczkomat */}
            <div className={`rounded-xl border transition-all ${
                shippingMethod === "paczkomat"
                  ? "border-forest ring-1 ring-forest"
                  : "border-warm-gray"
              }`}>
              <label
                className={`flex items-center justify-between p-4 cursor-pointer rounded-xl ${
                  shippingMethod === "paczkomat" ? "bg-sage/20" : "hover:border-forest/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingRadio"
                    checked={shippingMethod === "paczkomat"}
                    onChange={() => setShippingMethod("paczkomat")}
                    className="accent-forest h-4 w-4"
                  />
                  <Package className="h-5 w-5 text-forest" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{t("parcelLocker")}</p>
                    <p className="text-xs text-charcoal/60">Dostawa w 24-48h do wybranego automatu</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-forest">12,00 zł</span>
              </label>
              
              {shippingMethod === "paczkomat" && (
                <div className="px-4 pb-4 pt-2">
                  <div className="space-y-1.5 border-t border-forest/20 pt-4">
                    <label htmlFor="shippingPaczkomat" className="text-xs font-semibold text-charcoal flex justify-between">
                      <span>Kod Paczkomatu *</span>
                      <a href="https://inpost.pl/znajdz-paczkomat" target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">
                        Znajdź paczkomat
                      </a>
                    </label>
                    <Input
                      id="shippingPaczkomat"
                      name="shippingPaczkomat"
                      required
                      placeholder="np. WAW123M"
                      className="uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Kurier */}
            <label
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                shippingMethod === "kurier"
                  ? "border-forest bg-sage/20 ring-1 ring-forest"
                  : "border-warm-gray hover:border-forest/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shippingRadio"
                  checked={shippingMethod === "kurier"}
                  onChange={() => setShippingMethod("kurier")}
                  className="accent-forest h-4 w-4"
                />
                <Truck className="h-5 w-5 text-forest" />
                <div>
                  <p className="text-sm font-semibold text-charcoal">{t("courier")}</p>
                  <p className="text-xs text-charcoal/60">Dostawa kurierem pod same drzwi</p>
                </div>
              </div>
              <span className="text-sm font-bold text-forest">15,00 zł</span>
            </label>

            {/* Odbiór osobisty */}
            <div className={`rounded-xl border transition-all ${
                shippingMethod === "odbior"
                  ? "border-forest ring-1 ring-forest"
                  : "border-warm-gray"
              }`}>
              <label
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${
                  shippingMethod === "odbior" ? "bg-sage/20" : "hover:border-forest/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingRadio"
                    checked={shippingMethod === "odbior"}
                    onChange={() => setShippingMethod("odbior")}
                    className="accent-forest h-4 w-4"
                  />
                  <Store className="h-5 w-5 text-forest" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{t("pickup")}</p>
                    <p className="text-xs text-charcoal/60">Cosmic Loop (ustalane indywidualnie)</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-forest">0,00 zł</span>
              </label>

              {shippingMethod === "odbior" && (
                <div className="px-4 pb-4 pt-2">
                  <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium">
                    Ważne: W przypadku odbioru osobistego, prosimy o kontakt ze sprzedawcą w celu ustalenia terminu odbioru.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-white border-warm-gray shadow-sm">
          <CardHeader className="border-b border-warm-gray pb-4">
            <CardTitle className="font-serif text-xl font-bold text-forest flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Kupon rabatowy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {activeCoupon ? (
              <div className="p-3 bg-sage/20 border border-forest/30 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-forest uppercase">{activeCoupon.code}</p>
                  <p className="text-xs text-forest/70">Zniżka naliczona</p>
                </div>
                <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-charcoal hover:text-red-500 h-8 px-2">Usuń</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder="Twój kod..." 
                  className="uppercase h-9"
                />
                <Button 
                  type="button" 
                  onClick={handleApplyCoupon} 
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-forest hover:bg-forest/90 text-white h-9"
                >
                  Dodaj
                </Button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
          </CardContent>
        </Card>

        <Card className="bg-white border-warm-gray shadow-sm sticky top-24">
          <CardHeader className="border-b border-warm-gray pb-4">
            <CardTitle className="font-serif text-xl font-bold text-forest">
              {t("summary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="max-h-56 overflow-y-auto space-y-3 divide-y divide-warm-gray/50 pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 pt-2 first:pt-0">
                  <div className="relative w-12 h-12 rounded bg-cream overflow-hidden shrink-0 border border-warm-gray">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px]">Foto</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-charcoal truncate">{item.name}</p>
                    <p className="text-[11px] text-charcoal/60">{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-xs font-bold text-forest">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-warm-gray pt-4 space-y-2 text-xs text-charcoal/70">
              <div className="flex justify-between">
                <span>Wartość koszyka:</span>
                <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
              </div>
              
              {currentDiscount > 0 && (
                <div className="flex justify-between text-forest font-medium">
                  <span>Zniżka ({activeCoupon?.code}):</span>
                  <span>-{formatPrice(currentDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Dostawa ({shippingMethod}):</span>
                <span className="font-medium text-charcoal">{formatPrice(shippingCost)}</span>
              </div>
              
              <div className="border-t border-warm-gray pt-3 flex justify-between items-baseline text-sm">
                <span className="font-serif font-bold text-charcoal text-base">Razem do zapłaty:</span>
                <span className="font-serif font-bold text-xl text-forest">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-warm-gray">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-1 flex items-center">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(val) => setTermsAccepted(val as boolean)}
                    className="border-charcoal/40 data-[state=checked]:bg-forest data-[state=checked]:border-forest"
                  />
                </div>
                <div className="text-xs text-charcoal/70 leading-relaxed">
                  Akceptuję <Link href="/regulamin" className="underline hover:text-forest transition-colors" target="_blank">Regulamin sklepu</Link> oraz zgadzam się z <Link href="/polityka-prywatnosci" className="underline hover:text-forest transition-colors" target="_blank">Polityką Prywatności</Link>. Rozumiem, że towary tworzone na zamówienie według mojej specyfikacji mogą mieć ograniczony lub wyłączony zwrot, zgodnie z informacjami w regulaminie. *
                </div>
              </label>

              <Button
                type="submit"
                disabled={isPending || !termsAccepted}
                size="lg"
                className="w-full bg-forest hover:bg-forest/90 text-white font-medium shadow-md h-12 text-sm"
              >
                <Lock className="h-4 w-4 mr-2" />
                <span>{isPending ? "Łączenie z bramką płatności..." : "Zamawiam z obowiązkiem zapłaty"}</span>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-charcoal/50 leading-relaxed">
                Płatność kartą lub BLIK. Dane są w pełni szyfrowane przez Stripe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
