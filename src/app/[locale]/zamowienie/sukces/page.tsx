"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

function SuccessContent() {
  const t = useTranslations("Checkout");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();

  useEffect(() => {
    // Po udanej płatności wyczyść koszyk użytkownika
    clearCart();
  }, [clearCart]);

  return (
    <Card className="bg-white border-warm-gray shadow-md overflow-hidden">
      <CardContent className="p-8 sm:p-12 space-y-6">
        <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto text-forest animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="h-10 w-10 text-forest" />
        </div>

        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            {t("successTitle")}
          </h1>
          <p className="text-sm text-charcoal/70 mt-2 max-w-md mx-auto leading-relaxed">
            {t("successMessage")}
          </p>
        </div>

        {orderId && (
          <div className="p-4 bg-cream rounded-xl border border-warm-gray inline-block text-xs text-charcoal/80">
            <span className="font-medium">Identyfikator zamówienia:</span>{" "}
            <code className="font-mono font-bold text-forest">{orderId}</code>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-forest hover:bg-forest/90 text-white font-medium">
            <Link href="/konto" className="flex items-center gap-2">
              <span>Zobacz w historii zamówień</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-warm-gray">
            <Link href="/produkty" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Kontynuuj zakupy</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
      <Suspense fallback={<div className="h-64 bg-white rounded-xl border border-warm-gray animate-pulse" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
