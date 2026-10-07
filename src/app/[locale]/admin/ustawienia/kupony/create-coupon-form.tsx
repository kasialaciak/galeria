"use client";

import { useActionState, useEffect } from "react";
import { createCouponAction } from "@/actions/admin-coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateCouponForm() {
  const [state, formAction, isPending] = useActionState(createCouponAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Kupon został utworzony");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-serif text-forest">Nowy kupon</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="code" className="text-xs font-semibold text-charcoal">Kod rabatowy (np. ZIMA20)</label>
            <Input id="code" name="code" required className="uppercase" placeholder="MÓJ_KOD" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="type" className="text-xs font-semibold text-charcoal">Typ zniżki</label>
            <select
              id="type"
              name="type"
              className="flex h-10 w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="percent">Procentowa (%)</option>
              <option value="fixed">Kwotowa (PLN)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="value" className="text-xs font-semibold text-charcoal">Wartość</label>
            <Input id="value" name="value" type="number" step="0.01" min="0" required placeholder="np. 15" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="minOrderAmount" className="text-xs font-semibold text-charcoal">Minimalna kwota zam. (PLN)</label>
            <Input id="minOrderAmount" name="minOrderAmount" type="number" step="0.01" min="0" defaultValue="0" />
            <p className="text-[10px] text-charcoal/50">Wpisz 0 by brak minimum</p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-forest hover:bg-forest/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {isPending ? "Dodawanie..." : "Dodaj kupon"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
