import { getGalleryCategories, getGalleryWorks, getGalleryCarousel, getGalleryDescription } from "@/actions/gallery-actions";
import { GalleryAdminClient } from "./gallery-admin-client";

export default async function AdminGalleryPage() {
  const categories = await getGalleryCategories();
  const works = await getGalleryWorks();
  const carousel = await getGalleryCarousel();
  const description = await getGalleryDescription();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Galeria Prac</h1>
        <p className="text-muted-foreground">
          Zarządzaj zdjęciami, kategoriami i karuzelą w galerii.
        </p>
      </div>
      
      <GalleryAdminClient 
        initialCategories={categories}
        initialWorks={works}
        initialCarousel={carousel}
        initialDescription={description}
      />
    </div>
  );
}
