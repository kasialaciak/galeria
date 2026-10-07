"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { removeFromWishlistAction } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface WishlistClientListProps {
  initialItems: any[];
}

export function WishlistClientList({ initialItems }: WishlistClientListProps) {
  const t = useTranslations("Wishlist");
  const [items, setItems] = useState(initialItems);
  const { addItem } = useCart();

  const handleRemove = async (productId: string, name: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    await removeFromWishlistAction(productId);
    toast.info(`${name} usunięto z listy życzeń`);
  };

  const handleAddToCart = (item: any) => {
    addItem({
      productId: item.id,
      name: item.namePl,
      price: item.price,
      imageUrl: item.imageUrl || "",
      slug: item.slug,
    });
    toast.success(`${item.namePl} dodano do koszyka!`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden bg-white border border-warm-gray shadow-xs hover:shadow-md transition-all flex flex-col"
        >
          <Link
            href={`/produkty/${item.slug}`}
            className="relative aspect-square w-full bg-cream overflow-hidden block"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.namePl}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-charcoal/40 font-serif">
                Rękodzieło
              </div>
            )}
          </Link>

          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <Link href={`/produkty/${item.slug}`}>
                <h3 className="font-serif text-base font-semibold text-charcoal hover:text-forest transition-colors truncate">
                  {item.namePl}
                </h3>
              </Link>
              <p className="font-serif text-lg font-bold text-forest mt-1">
                {formatPrice(item.price)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-warm-gray/60 flex items-center justify-between gap-2">
              <Button
                size="sm"
                onClick={() => handleAddToCart(item)}
                className="flex-1 bg-forest hover:bg-forest/90 text-white text-xs h-8"
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                <span>{t("moveToCart")}</span>
              </Button>

              <button
                type="button"
                onClick={() => handleRemove(item.id, item.namePl)}
                className="h-8 w-8 rounded-md flex items-center justify-center text-charcoal/40 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title={t("removeFromWishlist")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
