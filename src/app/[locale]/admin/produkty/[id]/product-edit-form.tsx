"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { updateProductAction } from "@/actions/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface ProductEditFormProps {
  product: any; // Bierzemy any dla uproszczenia
  categories: { id: string; namePl: string }[];
  parentProducts: { id: string; namePl: string }[];
  productImages: { url: string }[];
}

export function ProductEditForm({
  product,
  categories,
  parentProducts,
  productImages,
}: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProductAction(product.id, formData);
      if (res.success) {
        toast.success("Produkt został pomyślnie zaktualizowany!");
        router.push("/admin/produkty");
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  const imagesText = productImages.map((img) => img.url).join("\n");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white border-warm-gray shadow-xs">
        <CardContent className="p-6 space-y-5">
          <h2 className="font-serif text-lg font-bold text-forest border-b border-warm-gray pb-3">
            Podstawowe informacje
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="namePl" className="text-xs font-semibold text-charcoal">
                Nazwa produktu (PL) *
              </label>
              <Input
                id="namePl"
                name="namePl"
                required
                defaultValue={product.namePl}
                placeholder="np. Ceramiczna misa w kolorze mchu"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="nameEn" className="text-xs font-semibold text-charcoal">
                Nazwa produktu (EN)
              </label>
              <Input
                id="nameEn"
                name="nameEn"
                defaultValue={product.nameEn}
                placeholder="np. Moss green ceramic bowl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="descriptionPl" className="text-xs font-semibold text-charcoal">
              Krótki opis produktu (PL) *
            </label>
            <textarea
              id="descriptionPl"
              name="descriptionPl"
              required
              rows={3}
              defaultValue={product.descriptionPl}
              placeholder="Opisz materiały, sposób wykonania, wymiary i charakter rękodzieła..."
              className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="descriptionEn" className="text-xs font-semibold text-charcoal">
              Krótki opis produktu (EN)
            </label>
            <textarea
              id="descriptionEn"
              name="descriptionEn"
              rows={3}
              defaultValue={product.descriptionEn}
              placeholder="English description..."
              className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-xs font-semibold text-charcoal">
                Cena w PLN *
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={(product.price / 100).toFixed(2)}
                placeholder="149.00"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="compareAtPrice" className="text-xs font-semibold text-charcoal">
                Cena przed obniżką (opcjonalnie)
              </label>
              <Input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""}
                placeholder="189.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kategoria i Warianty */}
      <Card className="bg-white border-warm-gray shadow-xs">
        <CardContent className="p-6 space-y-5">
          <h2 className="font-serif text-lg font-bold text-forest border-b border-warm-gray pb-3">
            Kategorie i Warianty
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="text-xs font-semibold text-charcoal">
                Kategoria
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={product.categoryId || "none"}
                className="flex h-10 w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest cursor-pointer"
              >
                <option value="none">-- Wybierz kategorię --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.namePl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="parentProductId" className="text-xs font-semibold text-charcoal">
                Produkt nadrzędny (jeśli to wariant)
              </label>
              <select
                id="parentProductId"
                name="parentProductId"
                defaultValue={product.parentProductId || "none"}
                className="flex h-10 w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest cursor-pointer"
              >
                <option value="none">-- Produkt główny (samodzielny) --</option>
                {parentProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.namePl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="variantLabelPl" className="text-xs font-semibold text-charcoal">
                Etykieta wariantu (PL)
              </label>
              <Input
                id="variantLabelPl"
                name="variantLabelPl"
                defaultValue={product.variantLabelPl || ""}
                placeholder="np. Kolor: Butelkowa zieleń lub Rozmiar: M"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="variantLabelEn" className="text-xs font-semibold text-charcoal">
                Etykieta wariantu (EN)
              </label>
              <Input
                id="variantLabelEn"
                name="variantLabelEn"
                defaultValue={product.variantLabelEn || ""}
                placeholder="e.g. Color: Forest Green"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zdjęcia produktu */}
      <Card className="bg-white border-warm-gray shadow-xs">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-forest border-b border-warm-gray pb-3">
            Zdjęcia produktu
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="imageUrls" className="text-xs font-semibold text-charcoal">
              Adresy URL do zdjęć (jedno pod drugim w nowych liniach) *
            </label>
            <textarea
              id="imageUrls"
              name="imageUrls"
              rows={4}
              defaultValue={imagesText}
              placeholder="https://images.unsplash.com/photo-...&#10;https://images.unsplash.com/photo-..."
              className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs font-mono text-charcoal shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
            />
            <p className="text-[11px] text-charcoal/50">
              Możesz wkleić bezpośrednie linki do zdjęć (np. z Unsplash, UploadThing lub własnego serwera). Pierwsze zdjęcie będzie zdjęciem głównym.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Flagi */}
      <Card className="bg-white border-warm-gray shadow-xs">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-forest border-b border-warm-gray pb-3">
            Widoczność
          </h2>

          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={product.isPublished}
                className="h-4 w-4 rounded border-warm-gray text-forest focus:ring-forest"
              />
              <span>Opublikowany (widoczny w sklepie dla klientów)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product.isFeatured}
                className="h-4 w-4 rounded border-warm-gray text-forest focus:ring-forest"
              />
              <span>Proponowany produkt (bestseller na stronie głównej)</span>
            </label>
          </div>
          
          <div className="pt-4 mt-2 border-t border-warm-gray">
            <label htmlFor="workTime" className="text-xs font-semibold text-charcoal">
              Czas pracy (widoczne tylko dla administratora)
            </label>
            <Input
              id="workTime"
              name="workTime"
              defaultValue={product.workTime || ""}
              className="mt-1.5 max-w-sm"
              placeholder="np. 2h, 1.5h, 30 min..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/produkty")}
        >
          Anuluj
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-forest hover:bg-forest/90 text-white font-medium px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          <span>{isPending ? "Zapisywanie..." : "Zapisz zmiany"}</span>
        </Button>
      </div>
    </form>
  );
}
