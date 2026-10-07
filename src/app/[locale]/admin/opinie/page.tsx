import { getAdminReviewsList } from "@/actions/reviews";
import { db } from "@/db";
import { products } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { AdminReviewActions } from "./admin-review-actions";
import { inArray } from "drizzle-orm";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviewsList();

  // Pobierz nazwy produktów dla opinii
  const productIds = Array.from(new Set(reviews.map((r) => r.productId)));
  let productMap = new Map<string, { namePl: string; slug: string }>();

  if (productIds.length > 0) {
    const prods = await db
      .select({ id: products.id, namePl: products.namePl, slug: products.slug })
      .from(products)
      .where(inArray(products.id, productIds));

    for (const p of prods) {
      productMap.set(p.id, { namePl: p.namePl, slug: p.slug });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-gray">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest">
            Opinie Klientów
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Zarządzaj opiniami i ocenami pozostawionymi przez zweryfikowanych kupujących ({reviews.length})
          </p>
        </div>
      </div>

      <Card className="bg-white border-warm-gray shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {reviews.length === 0 ? (
            <div className="p-12 text-center text-charcoal/60 space-y-3">
              <MessageSquare className="h-10 w-10 mx-auto text-charcoal/30" />
              <p className="text-sm font-medium">Brak opinii w sklepie</p>
              <p className="text-xs text-charcoal/50">
                Opinie pojawią się tutaj, gdy zweryfikowani kupujący ocenią swoje zamówione produkty.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/60 text-charcoal/70 uppercase tracking-wider border-b border-warm-gray font-semibold">
                  <tr>
                    <th className="p-4">Produkt</th>
                    <th className="p-4">Autor</th>
                    <th className="p-4">Ocena</th>
                    <th className="p-4">Opinia</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Data</th>
                    <th className="p-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-gray/60">
                  {reviews.map((rev) => {
                    const prod = productMap.get(rev.productId);
                    return (
                      <tr key={rev.id} className="hover:bg-cream/20 transition-colors">
                        <td className="p-4 font-semibold text-charcoal">
                          {prod?.namePl || "Produkt"}
                        </td>
                        <td className="p-4 text-charcoal/90">
                          {rev.userName}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < rev.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-warm-gray"
                                }`}
                              />
                            ))}
                            <span className="font-bold text-xs ml-1 text-charcoal">
                              {rev.rating}/5
                            </span>
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          {rev.title && (
                            <p className="font-semibold text-charcoal line-clamp-1 mb-0.5">
                              {rev.title}
                            </p>
                          )}
                          <p className="text-charcoal/70 line-clamp-2">
                            {rev.comment}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={rev.isApproved ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {rev.isApproved ? "Widoczna" : "Ukryta"}
                          </Badge>
                        </td>
                        <td className="p-4 text-charcoal/60 whitespace-nowrap">
                          {new Date(rev.createdAt).toLocaleDateString("pl-PL")}
                        </td>
                        <td className="p-4 text-right">
                          <AdminReviewActions
                            reviewId={rev.id}
                            isApproved={rev.isApproved}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
