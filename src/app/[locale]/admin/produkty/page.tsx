import { getAdminProductsList } from "@/actions/admin-products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Plus, Eye, ShoppingBag, Heart, Package, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { DeleteProductButton } from "./delete-product-button";

export default async function AdminProductsPage() {
  const productList = await getAdminProductsList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-gray">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest">
            Zarządzanie Produktami
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Katalog wyrobów rękodzielniczych w sklepie ({productList.length})
          </p>
        </div>

        <Button asChild className="bg-forest hover:bg-forest/90 text-white text-xs h-9">
          <Link href="/admin/produkty/nowy" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Dodaj produkt</span>
          </Link>
        </Button>
      </div>

      <Card className="bg-white border-warm-gray shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {productList.length === 0 ? (
            <div className="p-12 text-center text-charcoal/60 space-y-3">
              <Package className="h-10 w-10 mx-auto text-charcoal/30" />
              <p className="text-sm font-medium">Brak produktów w sklepie</p>
              <Button asChild size="sm" className="bg-forest hover:bg-forest/90 text-white">
                <Link href="/admin/produkty/nowy">Dodaj pierwszy produkt</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/60 text-charcoal/70 uppercase tracking-wider border-b border-warm-gray font-semibold">
                  <tr>
                    <th className="p-4">Produkt</th>
                    <th className="p-4">Cena</th>
                    
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Statystyki (Odsłony / Koszyk / Wishlist)</th>
                    <th className="p-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-gray/60">
                  {productList.map((prod) => (
                    <tr key={prod.id} className="hover:bg-cream/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-cream overflow-hidden border border-warm-gray shrink-0">
                            {prod.imageUrl ? (
                              <Image
                                src={prod.imageUrl}
                                alt={prod.namePl}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-charcoal/40">
                                Foto
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-charcoal line-clamp-1">
                              {prod.namePl}
                            </span>
                            <span className="text-[11px] font-mono text-charcoal/50">
                              /{prod.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-serif font-bold text-forest text-sm">
                        {formatPrice(prod.price)}
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-charcoal">
                          
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant={prod.isPublished ? "default" : "outline"} className="text-[10px] w-fit">
                            {prod.isPublished ? "Opublikowany" : "Szkic"}
                          </Badge>
                          {prod.isFeatured && (
                            <Badge variant="secondary" className="text-[10px] w-fit">
                              Wyróżniony
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-4 text-charcoal/80">
                          <span className="flex items-center gap-1" title="Wyświetlenia">
                            <Eye className="h-3.5 w-3.5 text-teal" />
                            {prod.viewCount}
                          </span>
                          <span className="flex items-center gap-1" title="Dodania do koszyka">
                            <ShoppingBag className="h-3.5 w-3.5 text-forest" />
                            {prod.addToCartCount}
                          </span>
                          <span className="flex items-center gap-1" title="Dodania do listy życzeń">
                            <Heart className="h-3.5 w-3.5 text-clay" />
                            {prod.addToWishlistCount}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-charcoal/60 hover:text-forest">
                            <Link href={`/produkty/${prod.slug}`} target="_blank" title="Podgląd w sklepie">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <DeleteProductButton productId={prod.id} name={prod.namePl} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
