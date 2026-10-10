import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ProductGallery } from "@/components/products/product-gallery";
import { VariantSelector, type VariantOption } from "@/components/products/variant-selector";
import { formatPrice } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { incrementProductView } from "@/actions/products";
import { getProductReviews, canUserReviewProduct } from "@/actions/reviews";
import { ProductTabs } from "@/components/products/product-tabs";
import { ProductDetailActions } from "./product-detail-actions";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Star, Sparkles } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations("Products");
  const tPage = await getTranslations("ProductPage");
  const settings = await getSettings();

  let product: any = null;
  let images: any[] = [];
  let variants: VariantOption[] = [];
  let category: any = null;

  try {
    // 1. Pobierz produkt po slugu
    const [foundProduct] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (foundProduct) {
      product = foundProduct;

      // Zlicz wyświetlenie w tle
      await incrementProductView(foundProduct.id);

      // 2. Pobierz zdjęcia produktu
      images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, foundProduct.id))
        .orderBy(productImages.sortOrder);

      // 3. Pobierz kategorię
      if (foundProduct.categoryId) {
        const [cat] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, foundProduct.categoryId))
          .limit(1);
        category = cat;
      }

      // 4. Pobierz warianty (jeśli ten produkt to wariant lub rodzic)
      const parentId = foundProduct.parentProductId || foundProduct.id;
      const allRelatedVariants = await db
        .select({
          id: products.id,
          slug: products.slug,
          labelPl: products.variantLabelPl,
          labelEn: products.variantLabelEn,
          price: products.price,
          stock: products.stock,
        })
        .from(products)
        .where(
          or(
            eq(products.id, parentId),
            eq(products.parentProductId, parentId)
          )
        );

      if (allRelatedVariants && allRelatedVariants.length > 1) {
        variants = allRelatedVariants;
      }
    }
  } catch (error) {
    console.warn("DB query for product details failed:", error);
  }

  // Fallback gdy produkt nie istnieje w bazie (np. przykładowy slug ze strony głównej)
  if (!product) {
    product = {
      id: "sample-" + slug,
      namePl: slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      nameEn: slug.replace(/-/g, " "),
      slug,
      descriptionPl:
        "Wyjątkowy przedmiot wykonany z najwyższą starannością w lokalnej pracowni rękodzieła. Każdy egzemplarz nosi indywidualne ślady pracy rzemieślnika, co nadaje mu unikatowy, niepowtarzalny charakter. Idealny na wyjątkowy prezent lub dopełnienie wnętrza.",
      descriptionEn: "A unique handcrafted piece created with great care in a local artisan workshop.",
      price: 18900,
      compareAtPrice: 22000,
      stock: 5,
      isFeatured: true,
    };
    images = [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80",
        alt: product.namePl,
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
        alt: product.namePl,
      },
    ];
  }

  const name = locale === "en" ? product.nameEn : product.namePl;
  const description = locale === "en" ? product.descriptionEn : product.descriptionPl;
  const specifications = Array.isArray(product.specifications) ? product.specifications : [];

  // Pobierz opinie produktu i uprawnienia użytkownika
  const { reviews, total: totalReviews, average: averageRating } = await getProductReviews(product.id);
  const eligibility = await canUserReviewProduct(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Powrót */}
      <div className="mb-6">
        <Link
          href="/produkty"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{tPage("backToProducts")}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Lewa kolumna: Galeria zdjęć */}
        <div>
          <ProductGallery images={images} title={name} />
        </div>

        {/* Prawa kolumna: Informacje, cena, warianty, przyciski akcji */}
        <div className="space-y-6">
          <div>
            {category && (
              <span className="text-xs font-semibold uppercase tracking-wider text-teal">
                {locale === "en" ? category.nameEn : category.namePl}
              </span>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1 leading-tight">
              {name}
            </h1>

            {/* Oceny (gwiazdki, średnia i liczba opinii) */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-warm-gray"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-xs text-charcoal">
                {averageRating > 0 ? averageRating.toFixed(1) : tPage("noRatings")}
              </span>
              <span className="text-xs text-charcoal/50">
                ({totalReviews} {totalReviews === 1 ? tPage("reviews_one") : totalReviews > 1 && totalReviews < 5 ? tPage("reviews_few") : tPage("reviews_many")})
              </span>
            </div>
          </div>

          {/* Cena i dostępność */}
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-forest">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-base text-charcoal/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <Badge variant="sage" className="ml-2 text-xs font-normal">
              {tPage("madeToOrder", { days: settings.shippingDays })}
            </Badge>
          </div>

          {/* Wybór wariantu (każdy wariant to osobny produkt) */}
          <VariantSelector
            currentProductId={product.id}
            variants={variants}
          />

          {/* Przyciski dodawania do koszyka i listy życzeń */}
          <ProductDetailActions
            product={{
              id: product.id,
              name,
              price: product.price,
              imageUrl: images[0]?.url || "",
              slug: product.slug,
              variantLabel: locale === "en" ? product.variantLabelEn : product.variantLabelPl,
            }}
          />

          {/* Opis produktu */}
          <div className="pt-6 border-t border-warm-gray space-y-3">
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              {tPage("aboutProduct")}
            </h3>
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          <div className="pt-6 border-t border-warm-gray/60 text-sm text-charcoal/80">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-forest shrink-0" />
              <span>{tPage("handmade")}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Zakładki: Opinie klientów + Specyfikacja produktu */}
      <ProductTabs
        productId={product.id}
        reviews={reviews}
        averageRating={averageRating}
        totalReviews={totalReviews}
        canReview={eligibility.canReview}
        canReviewReason={eligibility.reason}
        isLoggedIn={eligibility.isLoggedIn}
        specifications={specifications}
      />
    </div>
  );
}
