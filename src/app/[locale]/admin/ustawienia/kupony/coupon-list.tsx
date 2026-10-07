"use client";

import { useState } from "react";
import { deleteCouponAction } from "@/actions/admin-coupons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Ticket } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function CouponList({ initialCoupons }: { initialCoupons: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Na pewno usunąć ten kupon?")) return;
    setLoadingId(id);
    const res = await deleteCouponAction(id);
    if (res.success) {
      toast.success("Kupon usunięty");
    } else {
      toast.error(res.error || "Wystąpił błąd");
    }
    setLoadingId(null);
  };

  if (initialCoupons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-charcoal/50">
          <Ticket className="h-12 w-12 mb-3 text-charcoal/30" />
          <p>Brak aktywnych kuponów</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/60 border-b border-warm-gray text-xs uppercase tracking-wider text-charcoal/70">
            <tr>
              <th className="p-4 font-semibold">Kod</th>
              <th className="p-4 font-semibold">Wartość</th>
              <th className="p-4 font-semibold">Min. zamówienie</th>
              <th className="p-4 font-semibold">Użycia</th>
              <th className="p-4 font-semibold text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-gray">
            {initialCoupons.map((c) => (
              <tr key={c.id} className="hover:bg-cream/20">
                <td className="p-4 font-bold tracking-wider">{c.code}</td>
                <td className="p-4">
                  <Badge variant="secondary">
                    {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                  </Badge>
                </td>
                <td className="p-4 text-charcoal/70">
                  {c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : "Brak"}
                </td>
                <td className="p-4 text-charcoal/70">{c.usedCount}</td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    disabled={loadingId === c.id}
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
