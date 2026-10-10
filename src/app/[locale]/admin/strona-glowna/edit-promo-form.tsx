"use client";

import { useTransition } from "react";
import { updatePromoSectionAction } from "@/actions/admin-homepage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface EditPromoFormProps {
  initialTitle: string;
  initialTitleEn?: string;
  initialDescription: string;
  initialDescriptionEn?: string;
}

export function EditPromoForm({
  initialTitle,
  initialTitleEn,
  initialDescription,
  initialDescriptionEn,
}: EditPromoFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updatePromoSectionAction(formData);
      if (res.success) {
        toast.success("Sekcja promo galerii została zaktualizowana!");
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
          defaultValue={initialTitle || "Galeria naszych prac i kulisy pracowni"}
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
          Opis sekcji (PL) *
        </label>
        <Textarea
          id="descriptionPl"
          name="descriptionPl"
          defaultValue={initialDescription || "Odkryj autorskie projekty, niepowtarzalne zamówienia indywidualne oraz proces powstawania naszych wyrobów krok po kroku. Zobacz, jak kawałek gliny, srebra czy lnu zamienia się w małe dzieło sztuki."}
          required
          rows={4}
          className="text-xs resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descriptionEn" className="text-xs font-semibold text-charcoal">
          Opis sekcji (EN)
        </label>
        <Textarea
          id="descriptionEn"
          name="descriptionEn"
          defaultValue={initialDescriptionEn || ""}
          rows={4}
          className="text-xs resize-none"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-forest hover:bg-forest/90 text-white font-medium text-xs h-9"
        >
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </form>
  );
}
