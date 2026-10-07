"use client";

import { useTransition } from "react";
import { deleteCategoryAction } from "@/actions/admin-categories";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteCategoryButton({
  categoryId,
  name,
  isMini = false,
}: {
  categoryId: string;
  name: string;
  isMini?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Czy usunąć kategorię "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteCategoryAction(categoryId);
      if (res.success) {
        toast.success(`Usunięto kategorię: ${name}`);
      } else {
        toast.error("Nie udało się usunąć kategorii");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className={`${
        isMini ? "h-5 w-5 p-0" : "h-8 w-8"
      } text-charcoal/40 hover:text-red-600 hover:bg-red-50 cursor-pointer`}
      title="Usuń kategorię"
    >
      <Trash2 className={isMini ? "h-3 w-3" : "h-3.5 w-3.5"} />
    </Button>
  );
}
