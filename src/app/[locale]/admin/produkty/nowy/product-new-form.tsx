"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { createProductAction } from "@/actions/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface ProductNewFormProps {
  categories: { id: string; namePl: string }[];
  parentProducts: { id: string; namePl: string }[];
}

export function ProductNewForm({
  categories,
  parentProducts,
}: ProductNewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([
    { label: "Wymiary", value: "" },
    { label: "Materiał", value: "" },
  ]);

  const handleAddSpec = () => {
    setSpecs([...specs, { label: "", value: "" }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: "label" | "value", val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createProductAction(formData);
      if (res.success) {
        toast.success("Produkt został pomyślnie dodany!");
        router.push("/admin/produkty");
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

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
                placeholder="e.g. Color: Forest Green"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kafelki specyfikacji produktu */}
      <Card className="bg-white border-warm-gray shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-warm-gray pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-forest">
                Specyfikacja produktu (Kafelki)
              </h2>
              <p className="text-[11px] text-charcoal/60">
                Dodaj dowolne cechy, wymiary, skład lub sposób pielęgnacji, które wyświetlą się w kafelkach.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSpec}
              className="text-xs text-forest border-forest/30 hover:bg-forest/5"
            >
              + Dodaj cechę
            </Button>
          </div>

          <input
            type="hidden"
            name="specifications"
            value={JSON.stringify(specs.filter((s) => s.label.trim() || s.value.trim()))}
          />

          {specs.length === 0 ? (
            <div className="text-center py-6 text-xs text-charcoal/50 border border-dashed border-warm-gray rounded-lg">
              Brak dodanych cech. Kliknij &quot;+ Dodaj cechę&quot;, aby dodać kafelki (np. Wymiary, Materiał, Waga).
            </div>
          ) : (
            <div className="space-y-3">
              {specs.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-cream/40 rounded-lg border border-warm-gray/60">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-semibold text-charcoal/70 uppercase">
                      Nazwa cechy (np. Wymiary / Skład)
                    </label>
                    <Input
                      placeholder="np. Wymiary"
                      value={item.label}
                      onChange={(e) => handleSpecChange(idx, "label", e.target.value)}
                      className="bg-white text-xs h-8"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-semibold text-charcoal/70 uppercase">
                      Wartość cechy (np. 15 cm x 10 cm / 100% len)
                    </label>
                    <Input
                      placeholder="np. 18 cm x 12 cm"
                      value={item.value}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                      className="bg-white text-xs h-8"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSpec(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs"
                    >
                      Usuń
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                defaultChecked
                className="h-4 w-4 rounded border-warm-gray text-forest focus:ring-forest"
              />
              <span>Opublikowany (widoczny w sklepie dla klientów)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
              <input
                type="checkbox"
                name="isFeatured"
                className="h-4 w-4 rounded border-warm-gray text-forest focus:ring-forest"
              />
              <span>Proponowany produkt (bestseller na stronie głównej)</span>
            </label>
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
          <span>{isPending ? "Zapisywanie produktu..." : "Zapisz i opublikuj"}</span>
        </Button>
      </div>
    </form>
  );
}
