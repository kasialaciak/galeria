"use client";

import { useState, useTransition } from "react";
import { addProductReviewAction } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShieldCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("productId", productId);
    formData.set("rating", rating.toString());

    startTransition(async () => {
      const res = await addProductReviewAction(formData);
      if (res.success) {
        toast.success("Dziękujemy! Twoja opinia została dodana.");
        form.reset();
        setRating(5);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  return (
    <Card className="bg-sage/10 border-forest/20 shadow-xs mb-8">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-forest" />
          <h3 className="font-serif text-lg font-bold text-forest">
            Dodaj swoją opinię o produkcie
          </h3>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-forest bg-sage/30 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" /> Zweryfikowany zakup
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Twoja ocena w skali 1-5 *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} gwiazdek`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      (hoverRating || rating) >= star
                        ? "text-amber-500 fill-amber-500"
                        : "text-warm-gray"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-charcoal/70 ml-2">
                {hoverRating || rating}/5 gwiazdek
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="title" className="text-xs font-semibold text-charcoal">
              Tytuł opinii (opcjonalnie)
            </label>
            <Input
              id="title"
              name="title"
              placeholder="np. Cudowne rękodzieło, polecam z całego serca!"
              className="bg-white text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="comment" className="text-xs font-semibold text-charcoal">
              Treść Twojej opinii *
            </label>
            <textarea
              id="comment"
              name="comment"
              required
              rows={3}
              placeholder="Napisz jak produkt prezentuje się na żywo, jakość wykonania, kontakt..."
              className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-xs text-charcoal shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-forest hover:bg-forest/90 text-white font-medium text-xs px-6"
            >
              {isPending ? "Zapisywanie..." : "Opublikuj opinię"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
