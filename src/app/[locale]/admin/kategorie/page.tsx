import { db } from "@/db";
import { categories } from "@/db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CategoryNewForm } from "./category-new-form";
import { DeleteCategoryButton } from "./delete-category-button";
import Image from "next/image";

export default async function AdminCategoriesPage() {
  let catList: any[] = [];

  try {
    catList = await db.select().from(categories).orderBy(categories.sortOrder);
  } catch (e) {
    // fallback
  }

  const parentCats = catList.filter((c) => !c.parentId);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-warm-gray">
        <h1 className="font-serif text-3xl font-bold text-forest">
          Kategorie i Podkategorie
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Zarządzaj drzewem kategorii produktów rękodzielniczych w sklepie
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Lewa kolumna: formularz dodawania nowej kategorii */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-warm-gray shadow-xs">
            <CardHeader className="border-b border-warm-gray pb-4">
              <CardTitle className="font-serif text-lg font-bold text-forest">
                Dodaj kategorię
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CategoryNewForm parentCategories={parentCats} />
            </CardContent>
          </Card>
        </div>

        {/* Prawa kolumna: lista kategorii i ich podkategorii */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-warm-gray shadow-xs">
            <CardHeader className="border-b border-warm-gray pb-4">
              <CardTitle className="font-serif text-lg font-bold text-forest">
                Struktura kategorii ({catList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {parentCats.length === 0 ? (
                <p className="text-xs text-charcoal/50 text-center py-8">
                  Brak kategorii w bazie. Dodaj pierwszą za pomocą formularza obok.
                </p>
              ) : (
                <div className="space-y-4">
                  {parentCats.map((parent) => {
                    const subCats = catList.filter((c) => c.parentId === parent.id);

                    return (
                      <div
                        key={parent.id}
                        className="rounded-xl border border-warm-gray bg-cream/20 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {parent.image && (
                              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-cream border border-warm-gray shrink-0">
                                <Image
                                  src={parent.image}
                                  alt={parent.namePl}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="font-serif font-bold text-base text-forest">
                                {parent.namePl}
                              </h3>
                              <p className="text-[11px] text-charcoal/50 font-mono">
                                /{parent.slug}
                              </p>
                            </div>
                          </div>

                          <DeleteCategoryButton categoryId={parent.id} name={parent.namePl} />
                        </div>

                        {/* Podkategorie */}
                        {subCats.length > 0 && (
                          <div className="pl-6 border-l-2 border-warm-gray space-y-2 pt-2">
                            <p className="text-[10px] uppercase font-bold text-charcoal/50 tracking-wider">
                              Podkategorie:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {subCats.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-warm-gray text-xs"
                                >
                                  <span>{sub.namePl}</span>
                                  <DeleteCategoryButton categoryId={sub.id} name={sub.namePl} isMini />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
