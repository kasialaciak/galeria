"use client";

import { useTransition } from "react";
import { deleteProductAction } from "@/actions/admin-products";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteProductButton({
  productId,
  name,
}: {
  productId: string;
  name: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Czy na pewno chcesz usunąć produkt "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteProductAction(productId);
      if (res.success) {
        toast.success(`Usunięto produkt: ${name}`);
      } else {
        toast.error("Nie udało się usunąć produktu");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="h-8 w-8 text-charcoal/40 hover:text-red-600 hover:bg-red-50 cursor-pointer"
      title="Usuń produkt"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
