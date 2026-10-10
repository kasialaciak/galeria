"use client";

import { useTransition } from "react";
import { addCarouselSlideAction } from "@/actions/admin-homepage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddSlideForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await addCarouselSlideAction(formData);
      if (res.success) {
        toast.success("Dodano nowe zdjęcie do karuzeli!");
        form.reset();
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="imageUrl" className="text-xs font-semibold text-charcoal">
          Adres URL zdjęcia *
        </label>
        <Input
          id="imageUrl"
          name="imageUrl"
          required
          placeholder="https://images.unsplash.com/..."
          className="text-xs font-mono"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="titlePl" className="text-xs font-semibold text-charcoal">
          Napis / Tytuł na zdjęciu (PL)
        </label>
        <Input
          id="titlePl"
          name="titlePl"
          placeholder="np. Nowa kolekcja ceramiki"
          className="text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="titleEn" className="text-xs font-semibold text-charcoal">
          Napis / Tytuł na zdjęciu (EN)
        </label>
        <Input
          id="titleEn"
          name="titleEn"
          placeholder="e.g. New ceramic collection"
          className="text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="descriptionPl" className="text-xs font-semibold text-charcoal">
          Krótki podtytuł (PL)
        </label>
        <Input
          id="descriptionPl"
          name="descriptionPl"
          placeholder="np. Ręcznie toczone naczynia z duszą"
          className="text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="descriptionEn" className="text-xs font-semibold text-charcoal">
          Krótki podtytuł (EN)
        </label>
        <Input
          id="descriptionEn"
          name="descriptionEn"
          placeholder="e.g. Hand-turned vessels with a soul"
          className="text-xs"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="linkUrl" className="text-xs font-semibold text-charcoal">
          Link przycisku
        </label>
        <Input
          id="linkUrl"
          name="linkUrl"
          defaultValue="/produkty"
          placeholder="/produkty"
          className="text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-forest hover:bg-forest/90 text-white font-medium text-xs h-9 mt-2"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        <span>{isPending ? "Dodawanie..." : "Dodaj slajd"}</span>
      </Button>
    </form>
  );
}
