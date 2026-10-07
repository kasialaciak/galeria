"use client";

import { useTransition } from "react";
import { deleteReviewAction, toggleReviewApprovalAction } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AdminReviewActionsProps {
  reviewId: string;
  isApproved: boolean;
}

export function AdminReviewActions({ reviewId, isApproved }: AdminReviewActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleReviewApprovalAction(reviewId, isApproved);
      if (res.success) {
        toast.success(isApproved ? "Opinia została ukryta" : "Opinia została opublikowana");
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Czy na pewno chcesz trwale usunąć tę opinię?")) return;
    startTransition(async () => {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        toast.success("Opinia została usunięta");
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isPending}
        title={isApproved ? "Ukryj opinię" : "Zatwierdź opinię"}
        className="h-8 w-8 text-charcoal/70 hover:text-forest hover:bg-forest/10"
      >
        {isApproved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-emerald-600" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        title="Usuń opinię"
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
