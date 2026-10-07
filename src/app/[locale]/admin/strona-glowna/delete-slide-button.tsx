"use client";

import { useTransition } from "react";
import { deleteCarouselSlideAction } from "@/actions/admin-homepage";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteSlideButton({ slideId }: { slideId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Czy na pewno chcesz usunąć to zdjęcie z karuzeli?")) return;

    startTransition(async () => {
      const res = await deleteCarouselSlideAction(slideId);
      if (res.success) {
        toast.success("Usunięto slajd z karuzeli");
      } else {
        toast.error("Błąd podczas usuwania");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="h-7 w-7 text-charcoal/40 hover:text-red-600 hover:bg-red-50 cursor-pointer"
      title="Usuń slajd"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
