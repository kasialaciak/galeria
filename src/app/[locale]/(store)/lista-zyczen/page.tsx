import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { getWishlistItems } from "@/actions/wishlist";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { WishlistClientList } from "./wishlist-client-list";

export default async function WishlistPage() {
  const session = await auth();
  const t = await getTranslations("Wishlist");

  if (!session?.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-clay/10 text-clay rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest mb-3">
          {t("title")}
        </h1>
        <p className="text-sm text-charcoal/70 mb-6 max-w-sm mx-auto">
          Zaloguj się na swoje konto, aby zachowywać ulubione wyroby rękodzielnicze i mieć do nich dostęp z każdego urządzenia.
        </p>
        <Button asChild size="lg" className="bg-forest hover:bg-forest/90 text-white font-medium">
          <Link href="/konto/logowanie">Zaloguj się</Link>
        </Button>
      </div>
    );
  }

  const items = await getWishlistItems();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8 pb-4 border-b border-warm-gray">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
          {t("title")}
        </h1>
        <p className="text-xs text-charcoal/60 mt-1">
          Twoje zapisane unikatowe przedmioty ({items.length})
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-warm-gray p-8">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto text-charcoal/30 mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <p className="text-lg font-serif text-charcoal/80 mb-2">
            {t("empty")}
          </p>
          <p className="text-xs text-charcoal/50 mb-6 max-w-xs mx-auto">
            Gdy przeglądasz wyroby rękodzieła, kliknij ikonkę serduszka, aby zachować je na później.
          </p>
          <Button asChild className="bg-forest hover:bg-forest/90 text-white">
            <Link href="/produkty">Przeglądaj produkty</Link>
          </Button>
        </div>
      ) : (
        <WishlistClientList initialItems={items} />
      )}
    </div>
  );
}
