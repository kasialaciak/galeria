import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CategoryGrid, type CategoryItem } from "@/components/products/category-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductCard, type ProductCardProps } from "@/components/products/product-card";
import { db } from "@/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, and, desc, asc, or, ilike, isNull } from "drizzle-orm";

type Props = {
  searchParams: Promise<{
    kategoria?: string;
    szukaj?: string;
    sortuj?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { kategoria, szukaj, sortuj } = await searchParams;
  const t = await getTranslations("Products");

  let categoryTree: CategoryItem[] = [];
  let productList: ProductCardProps[] = [];

  try {
    // 1. Pobierz kategorie z bazy
    const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);

    if (allCategories && allCategories.length > 0) {
      const parentCats = allCategories.filter((c) => !c.parentId);
      categoryTree = parentCats.map((parent) => ({
        id: parent.id,
        namePl: parent.namePl,
        nameEn: parent.nameEn,
        slug: parent.slug,
        image: parent.image,
        children: allCategories
          .filter((c) => c.parentId === parent.id)
          .map((sub) => ({
            id: sub.id,
            namePl: sub.namePl,
            nameEn: sub.nameEn,
            slug: sub.slug,
            parentId: sub.parentId,
          })),
      }));
    }

    // 2. Przygotuj warunki zapytania o produkty
    const conditions = [
      eq(products.isPublished, true),
      isNull(products.parentProductId), // Nie pokazujemy osobno podwariantów na liście głównej
    ];

    // Filtracja po kategorii (jeśli wybrana)
    if (kategoria) {
      const matchedCat = allCategories.find((c) => c.slug === kategoria);
      if (matchedCat) {
        // Jeśli to kategoria rodzica, uwzględnij też jej podkategorie
        const childCatIds = allCategories
          .filter((c) => c.parentId === matchedCat.id)
          .map((c) => c.id);
        const allTargetCatIds = [matchedCat.id, ...childCatIds];

        conditions.push(or(...allTargetCatIds.map((id) => eq(products.categoryId, id)))!);
      }
    }

    // Wyszukiwanie po słowach kluczowych w nazwie i opisie
    if (szukaj && szukaj.trim()) {
      const term = `%${szukaj.trim()}%`;
      conditions.push(
        or(
          ilike(products.namePl, term),
          ilike(products.nameEn, term),
          ilike(products.descriptionPl, term),
          ilike(products.descriptionEn, term)
        )!
      );
    }

    // Sortowanie
    let orderByClause = desc(products.createdAt);
    if (sortuj === "popular") {
      orderByClause = desc(products.viewCount);
    } else if (sortuj === "price-asc") {
      orderByClause = asc(products.price);
    } else if (sortuj === "price-desc") {
      orderByClause = desc(products.price);
    }

    const dbProducts = await db
      .select({
        id: products.id,
        namePl: products.namePl,
        nameEn: products.nameEn,
        slug: products.slug,
        descriptionPl: products.descriptionPl,
        descriptionEn: products.descriptionEn,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        isFeatured: products.isFeatured,
        stock: products.stock,
        variantLabelPl: products.variantLabelPl,
        variantLabelEn: products.variantLabelEn,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(orderByClause);

    if (dbProducts && dbProducts.length > 0) {
      const images = await db
        .select()
        .from(productImages)
        .orderBy(productImages.sortOrder);

      const imageMap = new Map<string, string>();
      for (const img of images) {
        if (!imageMap.has(img.productId)) {
          imageMap.set(img.productId, img.url);
        }
      }

      productList = dbProducts.map((p) => ({
        ...p,
        imageUrl: imageMap.get(p.id) || null,
      }));
    }
  } catch (error) {
    console.warn("DB query in products page failed, using samples:", error);
  }

  // Fallback przykładowy jeśli w bazie nie ma jeszcze produktów
  const displayProducts =
    productList.length > 0
      ? productList
      : [
          {
            id: "p1",
            namePl: "Ręcznie toczony wazon z kamionki",
            nameEn: "Hand-thrown stoneware vase",
            slug: "recznie-toczony-wazon-z-kamionki",
            descriptionPl: "Unikatowy wazon w odcieniach mchu i leśnej zieleni, wypalany w wysokiej temperaturze.",
            descriptionEn: "Unique vase in moss and forest green shades, fired at high temperature.",
            price: 18900,
            compareAtPrice: 22000,
            imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 3,
            variantsCount: 2,
          },
          {
            id: "p2",
            namePl: "Bransoletka z surowym szmaragdem",
            nameEn: "Raw emerald gemstone bracelet",
            slug: "bransoletka-z-surowym-szmaragdem",
            descriptionPl: "Srebro próby 925 połączone z naturalnym, nieszlifowanym szmaragdem i rzemieniem.",
            descriptionEn: "Sterling silver 925 combined with raw uncut emerald and cord.",
            price: 24500,
            imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 2,
          },
          {
            id: "p3",
            namePl: "Lniany pled z frędzlami",
            nameEn: "Linen throw blanket with fringes",
            slug: "lniany-pled-z-fredzlami",
            descriptionPl: "100% zmiękczany len w kolorze naturalnego piasku i szałwii. Tkany ręcznie.",
            descriptionEn: "100% pre-washed linen in natural sand and sage color. Handwoven.",
            price: 32000,
            compareAtPrice: 38000,
            imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 5,
          },
          {
            id: "p4",
            namePl: "Ceramiczna czarka do herbaty",
            nameEn: "Ceramic tea bowl",
            slug: "ceramiczna-czarka-do-herbaty",
            descriptionPl: "Japońska technika shino, subtelny turkusowy akcent szkliwa.",
            descriptionEn: "Japanese shino technique with subtle turquoise glaze accents.",
            price: 7900,
            imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 8,
          },
          {
            id: "p5",
            namePl: "Srebrny pierścień z topazem",
            nameEn: "Silver ring with topaz",
            slug: "srebrny-pierscien-z-topazem",
            descriptionPl: "Ręcznie kuty pierścionek z błękitnym topazem london blue.",
            descriptionEn: "Hand-forged silver ring with london blue topaz gemstone.",
            price: 29000,
            imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            isFeatured: false,
            stock: 1,
          },
          {
            id: "p6",
            namePl: "Ręcznie tkany bieżnik na stół",
            nameEn: "Handwoven table runner",
            slug: "recznie-tkany-bieznik-na-stol",
            descriptionPl: "Naturalne włókna konopne i bawełniane w geometryczne wzory.",
            descriptionEn: "Natural hemp and cotton fibers in geometric folk patterns.",
            price: 14500,
            imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
            isFeatured: false,
            stock: 4,
          },
        ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 1. Kategorie i podkategorie produktów */}
      <CategoryGrid
        categories={categoryTree}
        selectedCategory={kategoria}
      />

      {/* 2. Wyszukiwarka słów kluczowych i filtry */}
      <Suspense fallback={<div className="h-16 bg-white rounded-xl mb-8 animate-pulse" />}>
        <ProductFilters />
      </Suspense>

      {/* 3. Lista produktów */}
      <div className="mb-6 flex justify-between items-center text-xs text-charcoal/60">
        <span>Znaleziono: {displayProducts.length} produktów</span>
        {kategoria && (
          <span className="font-semibold text-forest">
            Kategoria: {kategoria}
          </span>
        )}
      </div>

      {displayProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-warm-gray p-8">
          <p className="text-lg font-serif text-charcoal/80 mb-2">
            {t("noResults")}
          </p>
          <p className="text-xs text-charcoal/50">
            Spróbuj zmienić słowa kluczowe lub zresetować filtry kategorii.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
