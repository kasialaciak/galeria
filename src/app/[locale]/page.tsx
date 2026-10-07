import { getGalleryCategories, getGalleryWorks, getGalleryCarousel, getGalleryDescription } from "@/actions/gallery-actions";
import { GalleryClient } from "./gallery-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  return {
    title: "Galeria Prac",
    description: "Nasze zrealizowane prace i portfolio.",
  };
}

export default async function GalleryPage() {
  const categories = await getGalleryCategories();
  const works = await getGalleryWorks();
  const carousel = await getGalleryCarousel();
  const description = await getGalleryDescription();

  return (
    <main className="min-h-screen bg-background bg-spotted pb-20">
      <GalleryClient 
        categories={categories}
        works={works}
        carousel={carousel}
        description={description}
      />
    </main>
  );
}
