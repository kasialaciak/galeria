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
  const tCountries = useTranslations("Countries");
  const { items, totalPrice, clearCart } = useCart();
  const [shippingCountry, setShippingCountry] = useState("PL");
  const [shippingMethod, setShippingMethod] = useState<"kurier" | "paczkomat" | "odbior" | "eu_courier">("paczkomat");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discountCents: number; type: string; value: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isValidatingPaczkomat, setIsValidatingPaczkomat] = useState(false);

  const shippingCost = shippingMethod === "kurier" ? 1500 : shippingMethod === "paczkomat" ? 1200 : shippingMethod === "eu_courier" ? 6000 : 0;
  
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
        toast.success(t("couponAdded"));
      } else {
        setCouponError(res.error || t("couponError"));
        setActiveCoupon(null);
      }
    } catch (e) {
      setCouponError(t("couponServerError"));
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
        <h2 className="font-serif text-2xl font-bold text-forest mb-2">{t("cartEmptyTitle")}</h2>
        <p className="text-sm text-charcoal/60 mb-6">{t("cartEmptyDesc")}</p>
        <Button asChild className="bg-forest hover:bg-forest/90 text-white">
          <Link href="/produkty">{t("backToShop")}</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      toast.error(t("termsError"));
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    if (shippingMethod === "paczkomat" && shippingCountry === "PL") {
      const paczkomatCode = formData.get("shippingPaczkomat");
      if (paczkomatCode && typeof paczkomatCode === "string") {
        setIsValidatingPaczkomat(true);
        try {
          const res = await fetch(`https://api-pl-points.easypack24.net/v1/points/${paczkomatCode.toUpperCase()}`);
          if (!res.ok) {
            setIsValidatingPaczkomat(false);
            setErrorMsg(t("invalidPaczkomat"));
            toast.error(t("invalidPaczkomat"));
            return;
          }
        } catch (err) {
          // Ignore network errors and proceed
        }
        setIsValidatingPaczkomat(false);
      }
    }

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-1.5">
                <label htmlFor="shippingCountry" className="text-xs font-semibold text-charcoal">
                  {t("shippingCountry")}
                </label>
                <select
                  id="shippingCountry"
                  name="shippingCountry"
                  value={shippingCountry}
                  onChange={(e) => {
                    const country = e.target.value;
                    setShippingCountry(country);
                    if (country !== "PL") {
                      setShippingMethod("eu_courier");
                    } else {
                      setShippingMethod("kurier");
                    }
                  }}
                  className="flex h-9 w-full rounded-md border border-warm-gray bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
                >
                  <option value="PL">{tCountries("PL")}</option>
                  <option value="DE">{tCountries("DE")}</option>
                  <option value="CZ">{tCountries("CZ")}</option>
                  <option value="SK">{tCountries("SK")}</option>
                  <option value="LT">{tCountries("LT")}</option>
                  <option value="LV">{tCountries("LV")}</option>
                  <option value="EE">{tCountries("EE")}</option>
                  <option value="AT">{tCountries("AT")}</option>
                  <option value="FR">{tCountries("FR")}</option>
                  <option value="IT">{tCountries("IT")}</option>
                  <option value="ES">{tCountries("ES")}</option>
                  <option value="NL">{tCountries("NL")}</option>
                  <option value="BE">{tCountries("BE")}</option>
                  <option value="DK">{tCountries("DK")}</option>
                  <option value="SE">{tCountries("SE")}</option>
                  <option value="FI">{tCountries("FI")}</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="shippingEmail" className="text-xs font-semibold text-charcoal">
                  {t("email")}
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
                  {t("phone")}
                </label>
                <Input
                  id="shippingPhone"
                  name="shippingPhone"
                  type="tel"
                  required
                  placeholder={t("phonePlaceholder")}
                />
              </div>
            </div>

            {shippingMethod === "odbior" ? (
              <div className="p-3 bg-sage/10 rounded-lg border border-forest/20 text-xs text-charcoal/80">
                {t("pickupInfo")}
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
                {t("customerNotes")}
              </label>
              <textarea
                id="customerNotes"
                name="customerNotes"
                rows={3}
                className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-sm placeholder:text-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50"
                placeholder={t("customerNotesPlaceholder")}
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
            {shippingCountry === "PL" ? (
              <>
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
                        <p className="text-xs text-charcoal/60">{t("parcelLockerDesc")}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-forest">12,00 zł</span>
                  </label>
                  
                  {shippingMethod === "paczkomat" && (
                    <div className="px-4 pb-4 pt-2">
                      <div className="space-y-1.5 border-t border-forest/20 pt-4">
                        <label htmlFor="shippingPaczkomat" className="text-xs font-semibold text-charcoal flex justify-between">
                          <span>{t("parcelLockerCode")}</span>
                          <a href="https://inpost.pl/znajdz-paczkomat" target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">
                            {t("findLocker")}
                          </a>
                        </label>
                        <Input
                          id="shippingPaczkomat"
                          name="shippingPaczkomat"
                          required
                          placeholder={t("parcelLockerPlaceholder")}
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
                      <p className="text-xs text-charcoal/60">{t("courierDesc")}</p>
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
                        <p className="text-xs text-charcoal/60">{t("pickupDesc")}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-forest">0,00 zł</span>
                  </label>

                  {shippingMethod === "odbior" && (
                    <div className="px-4 pb-4 pt-2">
                      <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium">
                        {t("pickupWarning")}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === "eu_courier"
                    ? "border-forest bg-sage/20 ring-1 ring-forest"
                    : "border-warm-gray hover:border-forest/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingRadio"
                    checked={shippingMethod === "eu_courier"}
                    onChange={() => setShippingMethod("eu_courier")}
                    className="accent-forest h-4 w-4"
                  />
                  <Truck className="h-5 w-5 text-forest" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{t("euCourier")}</p>
                    <p className="text-xs text-charcoal/60">{t("euCourierDesc")}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-forest">60,00 zł</span>
              </label>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-white border-warm-gray shadow-sm">
          <CardHeader className="border-b border-warm-gray pb-4">
            <CardTitle className="font-serif text-xl font-bold text-forest flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {t("couponTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {activeCoupon ? (
              <div className="p-3 bg-sage/20 border border-forest/30 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-forest uppercase">{activeCoupon.code}</p>
                  <p className="text-xs text-forest/70">{t("discountApplied")}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-charcoal hover:text-red-500 h-8 px-2">{t("remove")}</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder={t("yourCode")} 
                  className="uppercase h-9"
                />
                <Button 
                  type="button" 
                  onClick={handleApplyCoupon} 
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-forest hover:bg-forest/90 text-white h-9"
                >
                  {t("add")}
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
                <span>{t("subtotalLabel")}</span>
                <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
              </div>
              
              {currentDiscount > 0 && (
                <div className="flex justify-between text-forest font-medium">
                  <span>{t("discountLabel", { code: activeCoupon?.code || "" })}</span>
                  <span>-{formatPrice(currentDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>{t("shippingLabel", { method: shippingMethod })}</span>
                <span className="font-medium text-charcoal">{formatPrice(shippingCost)}</span>
              </div>
              
              <div className="border-t border-warm-gray pt-3 flex justify-between items-baseline text-sm">
                <span className="font-serif font-bold text-charcoal text-base">{t("totalLabel")}</span>
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
                  {t("termsPrefix")} <Link href="/regulamin" className="underline hover:text-forest transition-colors" target="_blank">{t("termsLink")}</Link> {t("termsMiddle")} <Link href="/polityka-prywatnosci" className="underline hover:text-forest transition-colors" target="_blank">{t("privacyLink")}</Link>{t("termsSuffix")}
                </div>
              </label>

              <Button
                type="submit"
                disabled={isPending || isValidatingPaczkomat || !termsAccepted}
                size="lg"
                className="w-full bg-forest hover:bg-forest/90 text-white font-medium shadow-md h-12 text-sm"
              >
                <Lock className="h-4 w-4 mr-2" />
                <span>{isValidatingPaczkomat ? t("validatingPaczkomat") : isPending ? t("connectingPayment") : t("orderAndPay")}</span>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-charcoal/50 leading-relaxed">
                {t("paymentInfo")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
