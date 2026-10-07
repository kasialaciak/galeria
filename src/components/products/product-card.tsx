"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export interface ProductCardProps {
  id: string;
  namePl: string;
  nameEn: string;
  slug: string;
  descriptionPl?: string | null;
  descriptionEn?: string | null;
  price: number; // w groszach
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  shippingDays?: string;
  variantLabel?: string | null;
  variantsCount?: number;
}

export function ProductCard({
  id,
  namePl,
  nameEn,
  slug,
  descriptionPl,
  descriptionEn,
  price,
  compareAtPrice,
  imageUrl,
  isFeatured,
  shippingDays = "21",
  variantLabel,
  variantsCount = 0,
}: ProductCardProps) {
  const t = useTranslations("Products");
  const locale = useLocale();
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const name = locale === "en" ? nameEn : namePl;
  const description = locale === "en" ? descriptionEn : descriptionPl;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: id,
      name,
      price,
      imageUrl: imageUrl || "",
      variantLabel: variantLabel || undefined,
      slug,
    });

    setIsAdded(true);
    toast.success(`${name} - ${t("addToCart")}`);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.info(
      isWishlisted
        ? `${name} usunięto z listy życzeń`
        : `${name} dodano do listy życzeń`
    );
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-warm-gray bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      {/* Zdjęcie produktu */}
      <Link href={`/produkty/${slug}`} className="relative aspect-square w-full overflow-hidden bg-cream block">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-charcoal/30 bg-cream">
            <span className="font-serif italic text-sm">Rękodzieło</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {compareAtPrice && compareAtPrice > price && (
            <Badge variant="clay" className="text-[10px] tracking-wider uppercase">
              Promocja
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
              Bestseller
            </Badge>
          )}
        </div>

        {/* Przycisk Wishlist */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm hover:text-clay hover:bg-white transition-all cursor-pointer"
          aria-label={t("addToWishlist")}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-clay text-clay" : ""
            }`}
          />
        </button>
      </Link>

      {/* Informacje o produkcie */}
      <div className="flex flex-1 flex-col p-4">
        {variantsCount > 1 && (
          <p className="text-[11px] font-semibold text-teal uppercase tracking-wider mb-1">
            {variantsCount} warianty
          </p>
        )}
        <Link href={`/produkty/${slug}`}>
          <h3 className="font-serif text-base font-semibold text-charcoal group-hover:text-forest transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        {description && (
          <p className="mt-1 text-xs text-charcoal/65 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <p className="mt-2 text-[10px] text-charcoal/50">
          Robione na zamówienie • do {shippingDays} dni roboczych
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-bold text-forest">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-xs text-charcoal/40 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            className={`h-8 px-3 rounded-md transition-colors ${
              isAdded
                ? "bg-teal text-white"
                : "bg-forest hover:bg-forest/90 text-white"
            }`}
          >
            {isAdded ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
            <span className="ml-1 text-xs">{t("addToCart")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
