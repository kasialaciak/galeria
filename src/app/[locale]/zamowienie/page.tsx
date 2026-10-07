import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/routing";
import { CheckoutClientForm } from "./checkout-client-form";

export default async function CheckoutPage() {
  const session = await auth();
  const t = await getTranslations("Checkout");

  if (!session?.user) {
    redirect({ href: "/konto/logowanie?callbackUrl=/zamowienie", locale: "pl" });
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8 pb-4 border-b border-warm-gray">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
          {t("title")}
        </h1>
        <p className="text-xs text-charcoal/60 mt-1">
          Krok przed bezpieczną płatnością przez Stripe
        </p>
      </div>

      <CheckoutClientForm user={session.user} />
    </div>
  );
}
