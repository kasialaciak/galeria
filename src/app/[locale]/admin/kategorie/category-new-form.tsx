"use client";

import { useTransition } from "react";
import { createCategoryAction } from "@/actions/admin-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CategoryNewFormProps {
  parentCategories: { id: string; namePl: string }[];
}

export function CategoryNewForm({ parentCategories }: CategoryNewFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createCategoryAction(formData);
      if (res.success) {
        toast.success("Kategoria została dodana!");
        form.reset();
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="namePl" className="text-xs font-semibold text-charcoal">
          Nazwa kategorii (PL) *
        </label>
        <Input id="namePl" name="namePl" required placeholder="np. Ceramika" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="nameEn" className="text-xs font-semibold text-charcoal">
          Nazwa kategorii (EN)
        </label>
        <Input id="nameEn" name="nameEn" placeholder="e.g. Ceramics" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="parentId" className="text-xs font-semibold text-charcoal">
          Kategoria nadrzędna (dla podkategorii)
        </label>
        <select
          id="parentId"
          name="parentId"
          className="flex h-10 w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest cursor-pointer"
        >
          <option value="none">-- Kategoria główna (brak rodzica) --</option>
          {parentCategories.map((p) => (
            <option key={p.id} value={p.id}>
              {p.namePl}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="image" className="text-xs font-semibold text-charcoal">
          Zdjęcie kategorii (URL)
        </label>
        <Input
          id="image"
          name="image"
          placeholder="https://images.unsplash.com/photo-..."
          className="text-xs font-mono"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-forest hover:bg-forest/90 text-white font-medium text-xs h-9"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        <span>{isPending ? "Dodawanie..." : "Dodaj kategorię"}</span>
      </Button>
    </form>
  );
}
