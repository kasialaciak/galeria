"use client";

import { Link } from "@/i18n/routing";
import { formatPrice } from "@/lib/utils";

export interface VariantOption {
  id: string;
  slug: string;
  labelPl?: string | null;
  labelEn?: string | null;
  price: number;
  stock: number;
}

interface VariantSelectorProps {
  currentProductId: string;
  variants: VariantOption[];
  parentSlug?: string;
}

export function VariantSelector({
  currentProductId,
  variants,
}: VariantSelectorProps) {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className="space-y-3 py-4 border-y border-warm-gray">
      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">
        Dostępne warianty produktu:
      </span>
      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isSelected = v.id === currentProductId;
          const label = v.labelPl || "Wariant";

          return (
            <Link
              key={v.id}
              href={`/produkty/${v.slug}`}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                isSelected
                  ? "border-forest bg-forest text-white shadow-xs"
                  : "border-warm-gray bg-white text-charcoal hover:border-forest/60 hover:bg-sage/30"
              }`}
            >
              <span>{label}</span>
              <span className={`text-[11px] ${isSelected ? "text-cream/90" : "text-forest font-semibold"}`}>
                {formatPrice(v.price)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
