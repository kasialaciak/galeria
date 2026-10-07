"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { incrementAddToCartCount, incrementWishlistCount } from "@/actions/products";

interface ProductDetailActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
    variantLabel?: string | null;
  };
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const t = useTranslations("Products");
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        slug: product.slug,
        variantLabel: product.variantLabel || undefined,
      });
    }

    setIsAdded(true);
    toast.success(`${product.name} (${quantity} szt.) - dodano do koszyka!`);
    setTimeout(() => setIsAdded(false), 1500);

    // Aktualizuj statystykę w bazie
    await incrementAddToCartCount(product.id);
  };

  const handleToggleWishlist = async () => {
    setIsWishlisted(!isWishlisted);
    toast.info(
      isWishlisted
        ? `${product.name} usunięto z listy życzeń`
        : `${product.name} dodano do listy życzeń`
    );
    if (!isWishlisted) {
      await incrementWishlistCount(product.id);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        {/* Ilość sztuk */}
        <div className="flex items-center border border-warm-gray rounded-lg bg-cream text-sm">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3.5 py-2.5 text-charcoal hover:text-forest font-medium cursor-pointer"
          >
            -
          </button>
          <span className="px-3 font-semibold min-w-8 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3.5 py-2.5 text-charcoal hover:text-forest font-medium cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Dodaj do koszyka */}
        <Button
          size="lg"
          onClick={handleAddToCart}
          className={`flex-1 h-11 text-sm font-semibold transition-all ${
            isAdded
              ? "bg-teal text-white shadow-xs"
              : "bg-forest hover:bg-forest/90 text-white shadow-md"
          }`}
        >
          {isAdded ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <ShoppingBag className="h-4 w-4 mr-2" />
          )}
          <span>{isAdded ? "Dodano do koszyka" : t("addToCart")}</span>
        </Button>

        {/* Lista życzeń */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleToggleWishlist}
          className={`h-11 w-11 rounded-lg border-warm-gray transition-colors ${
            isWishlisted
              ? "text-clay border-clay/50 bg-clay/5"
              : "text-charcoal hover:text-clay"
          }`}
          aria-label={t("addToWishlist")}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-clay text-clay" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
