"use client";

import { useTransition } from "react";
import { updateAboutSectionAction } from "@/actions/admin-homepage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface EditAboutFormProps {
  initialTitle: string;
  initialTitleEn?: string;
  initialDescription: string;
  initialDescriptionEn?: string;
  initialImageUrl: string;
}

export function EditAboutForm({
  initialTitle,
  initialTitleEn,
  initialDescription,
  initialDescriptionEn,
  initialImageUrl,
}: EditAboutFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateAboutSectionAction(formData);
      if (res.success) {
        toast.success("Sekcja 'O nas' została zaktualizowana!");
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="titlePl" className="text-xs font-semibold text-charcoal">
          Tytuł sekcji (PL) *
        </label>
        <Input
          id="titlePl"
          name="titlePl"
          defaultValue={initialTitle || "Tradycja, natura i pasja tworzenia"}
          required
          className="text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="titleEn" className="text-xs font-semibold text-charcoal">
          Tytuł sekcji (EN)
        </label>
        <Input
          id="titleEn"
          name="titleEn"
          defaultValue={initialTitleEn || ""}
          className="text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descriptionPl" className="text-xs font-semibold text-charcoal">
          Treść opisu pracowni (PL) *
        </label>
        <textarea
          id="descriptionPl"
          name="descriptionPl"
          defaultValue={
            initialDescription ||
            "W naszej pracowni wierzymy, że przedmioty codziennego użytku powinny nieść ze sobą ciepło ludzkich rąk i szacunek do natury. Każdy egzemplarz ceramiki, biżuterii i tkaniny powstaje z ekologicznych materiałów..."
          }
          required
          rows={5}
          className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descriptionEn" className="text-xs font-semibold text-charcoal">
          Treść opisu pracowni (EN)
        </label>
        <textarea
          id="descriptionEn"
          name="descriptionEn"
          defaultValue={initialDescriptionEn || ""}
          rows={5}
          className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="imageUrl" className="text-xs font-semibold text-charcoal">
          Adres URL zdjęcia pracowni *
        </label>
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={
            initialImageUrl ||
            "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80"
          }
          required
          className="text-xs font-mono"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-forest hover:bg-forest/90 text-white font-medium text-xs h-9 px-6"
      >
        <Save className="h-4 w-4 mr-1.5" />
        <span>{isPending ? "Zapisywanie zmian..." : "Zapisz sekcję"}</span>
      </Button>
    </form>
  );
}
