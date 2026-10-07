import { HeroCarousel } from "@/components/home/hero-carousel";
import { FeaturedProducts } from "@/components/home/featured-products";
import { AboutSection } from "@/components/home/about-section";
import { GalleryPromoSection } from "@/components/home/gallery-promo-section";
import { db } from "@/db";
import { products, homepageContent, productImages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export default async function HomePage() {
  let slides: any[] = [];
  let featured: any[] = [];
  let aboutContent: any = null;

  try {
    // 1. Pobierz slajdy karuzeli
    const carouselData = await db
      .select()
      .from(homepageContent)
      .where(
        and(
          eq(homepageContent.section, "carousel"),
          eq(homepageContent.isActive, true)
        )
      )
      .orderBy(homepageContent.sortOrder);

    if (carouselData && carouselData.length > 0) {
      slides = carouselData.map((s) => ({
        id: s.id,
        imageUrl: s.imageUrl || "",
        titlePl: s.titlePl,
        titleEn: s.titleEn,
        descriptionPl: s.descriptionPl,
        descriptionEn: s.descriptionEn,
        linkUrl: s.linkUrl,
      }));
    }

    // 2. Pobierz produkty (proponowane + nowości)
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
      .where(eq(products.isPublished, true))
      .orderBy(desc(products.isFeatured), desc(products.createdAt))
      .limit(8);

    if (dbProducts && dbProducts.length > 0) {
      // Pobierz pierwsze zdjęcie dla każdego produktu
      const productIds = dbProducts.map((p) => p.id);
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

      featured = dbProducts.map((p) => ({
        ...p,
        imageUrl: imageMap.get(p.id) || null,
      }));
    }

    // 3. Pobierz treść sekcji "O nas"
    const aboutData = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "about"))
      .limit(1);

    if (aboutData && aboutData.length > 0) {
      aboutContent = aboutData[0];
    }
  } catch (error) {
    // Jeśli baza danych nie jest jeszcze podłączona / zmigrowana,
    // komponenty użyją swoich wbudowanych, pięknych fallbacków
    console.warn("Could not query DB for homepage, using defaults:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Karuzela przesuwających się zdjęć co kilka sekund */}
      <HeroCarousel slides={slides} />

      {/* 2. "Proponowane produkty" - najlepiej sprzedające się i nowo dodane */}
      <FeaturedProducts products={featured} />

      {/* 3. Sekcja: Odnośnik do Galerii prac */}
      <GalleryPromoSection />

      {/* 4. Dolna sekcja: Zdjęcie + Opis edytowalne z panelu administracyjnego */}
      <AboutSection
        titlePl={aboutContent?.titlePl}
        titleEn={aboutContent?.titleEn}
        descriptionPl={aboutContent?.descriptionPl}
        descriptionEn={aboutContent?.descriptionEn}
        imageUrl={aboutContent?.imageUrl}
      />
    </div>
  );
}
