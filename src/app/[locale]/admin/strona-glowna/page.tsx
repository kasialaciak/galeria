import { db } from "@/db";
import { homepageContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddSlideForm } from "./add-slide-form";
import { DeleteSlideButton } from "./delete-slide-button";
import { EditAboutForm } from "./edit-about-form";
import Image from "next/image";

export default async function AdminHomepagePage() {
  let slides: any[] = [];
  let aboutSection: any = null;

  try {
    slides = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "carousel"))
      .orderBy(homepageContent.sortOrder);

    const [about] = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "about"))
      .limit(1);

    aboutSection = about;
  } catch (e) {
    // fallback
  }

  return (
    <div className="space-y-10">
      <div className="pb-4 border-b border-warm-gray">
        <h1 className="font-serif text-3xl font-bold text-forest">
          Zarządzanie Stroną Główną
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Dostosuj przesuwające się zdjęcia w karuzeli oraz dolną sekcję ze zdjęciem i opisem
        </p>
      </div>

      {/* 1. Karuzela górna */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-forest">
            1. Przesuwające się zdjęcia (Karuzela na górze)
          </h2>
          <span className="text-xs text-charcoal/50">
            Wyświetlane pojedynczo, zmieniają się co 5 sekund
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <Card className="bg-white border-warm-gray shadow-xs">
              <CardHeader className="border-b border-warm-gray pb-3">
                <CardTitle className="font-serif text-base font-bold text-forest">
                  Dodaj nowe zdjęcie do karuzeli
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <AddSlideForm />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-white border-warm-gray shadow-xs">
              <CardHeader className="border-b border-warm-gray pb-3">
                <CardTitle className="font-serif text-base font-bold text-forest">
                  Aktualne slajdy ({slides.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {slides.length === 0 ? (
                  <p className="text-xs text-charcoal/50 text-center py-6">
                    Brak customowych slajdów w bazie — strona główna używa domyślnych zdjęć demonstracyjnych. Dodaj własne slajdy formularzem obok.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {slides.map((s) => (
                      <div
                        key={s.id}
                        className="relative rounded-xl border border-warm-gray overflow-hidden bg-cream/30 p-2 space-y-2"
                      >
                        <div className="relative aspect-16/9 w-full rounded-lg overflow-hidden bg-cream">
                          {s.imageUrl && (
                            <Image
                              src={s.imageUrl}
                              alt={s.titlePl || "Slajd"}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-2 px-1">
                          <div>
                            <p className="font-semibold text-xs text-charcoal line-clamp-1">
                              {s.titlePl || "Bez tytułu"}
                            </p>
                            <p className="text-[11px] text-charcoal/60 line-clamp-1">
                              {s.descriptionPl || s.linkUrl}
                            </p>
                          </div>
                          <DeleteSlideButton slideId={s.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 2. Sekcja O nas na dole strony głównej */}
      <div className="space-y-6 pt-6 border-t border-warm-gray">
        <div>
          <h2 className="font-serif text-xl font-bold text-forest">
            2. Dolna sekcja: Zdjęcie oraz Opis pracowni
          </h2>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Zmieniaj treść i fotografię widoczną na samym dole strony głównej
          </p>
        </div>

        <Card className="bg-white border-warm-gray shadow-xs max-w-3xl">
          <CardContent className="p-6">
            <EditAboutForm
              initialTitle={aboutSection?.titlePl || ""}
              initialDescription={aboutSection?.descriptionPl || ""}
              initialImageUrl={aboutSection?.imageUrl || ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
