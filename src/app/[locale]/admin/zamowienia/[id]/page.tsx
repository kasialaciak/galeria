import { getAdminOrderById } from "@/actions/admin-orders";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OrderStatusSelector } from "../order-status-selector";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Package, Calendar, User, MapPin, Truck, StickyNote, CreditCard } from "lucide-react";
import { notFound } from "next/navigation";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage(props: OrderDetailsPageProps) {
  const params = await props.params;
  const { id } = params;

  const order = await getAdminOrderById(id);

  if (!order) {
    return notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/zamowienia"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Wróć do listy zamówień</span>
        </Link>
      </div>

      <div className="pb-4 border-b border-warm-gray flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest">
            Zamówienie {order.orderNumber}
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleString("pl-PL")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolumna 1: Klient i adres */}
        <div className="space-y-6">
          <Card className="bg-white border-warm-gray shadow-xs">
            <CardHeader className="pb-3 border-b border-warm-gray bg-cream/30">
              <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
                <User className="h-4 w-4 text-teal" /> Klient
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-2">
              <p className="font-medium text-charcoal">{order.shippingName}</p>
              {order.userEmail && (
                <p className="text-charcoal/70">{order.userEmail}</p>
              )}
              {order.shippingPhone && (
                <p className="text-charcoal/70">Tel: {order.shippingPhone}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-warm-gray shadow-xs">
            <CardHeader className="pb-3 border-b border-warm-gray bg-cream/30">
              <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal" /> Adres wysyłki
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-1 text-charcoal/80">
              <p>{order.shippingAddress}</p>
              <p>{order.shippingPostalCode} {order.shippingCity}</p>
              <p>{order.shippingCountry}</p>
            </CardContent>
          </Card>

          {order.customerNotes && (
            <Card className="bg-sage/20 border-sage/50 shadow-xs">
              <CardHeader className="pb-3 border-b border-sage/30">
                <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
                  <StickyNote className="h-4 w-4" /> Uwagi do zamówienia
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm italic text-charcoal/90 whitespace-pre-wrap">
                {order.customerNotes}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Kolumna 2 i 3: Produkty i wysyłka */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border-warm-gray shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-warm-gray bg-cream/30">
              <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
                <Package className="h-4 w-4 text-teal" /> Lista produktów
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream/20 text-charcoal/60 uppercase tracking-wider border-b border-warm-gray text-[10px]">
                    <tr>
                      <th className="p-4">Produkt</th>
                      <th className="p-4 text-center">Ilość</th>
                      <th className="p-4 text-right">Cena jedn.</th>
                      <th className="p-4 text-right">Suma</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-gray/60">
                    {order.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-4">
                          <p className="font-medium text-charcoal">{item.productName}</p>
                          {item.variantLabel && (
                            <p className="text-xs text-charcoal/60">{item.variantLabel}</p>
                          )}
                          {item.workTime && (
                            <p className="text-xs text-forest/80 mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Czas pracy: {item.workTime}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-center text-charcoal/80">{item.quantity}</td>
                        <td className="p-4 text-right text-charcoal/80">{formatPrice(item.unitPrice)}</td>
                        <td className="p-4 text-right font-medium text-charcoal">{formatPrice(item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-white border-warm-gray shadow-xs">
              <CardHeader className="pb-3 border-b border-warm-gray bg-cream/30">
                <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
                  <Truck className="h-4 w-4 text-teal" /> Dostawa
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-2 text-charcoal/80">
                <div className="flex justify-between">
                  <span>Metoda:</span>
                  <span className="font-medium text-charcoal capitalize">{order.shippingMethod}</span>
                </div>
                {order.shippingPaczkomat && (
                  <div className="flex justify-between">
                    <span>Paczkomat:</span>
                    <span className="font-semibold text-forest">{order.shippingPaczkomat}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-warm-gray pt-2 mt-2">
                  <span>Koszt dostawy:</span>
                  <span className="font-medium text-charcoal">{formatPrice(order.shippingCost)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-warm-gray shadow-xs">
              <CardHeader className="pb-3 border-b border-warm-gray bg-cream/30">
                <CardTitle className="text-sm font-semibold text-forest flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-teal" /> Podsumowanie płatności
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-2 text-charcoal/80">
                <div className="flex justify-between">
                  <span>Suma za produkty:</span>
                  <span>{formatPrice(order.totalAmount - order.shippingCost + order.discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wysyłka:</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-teal">
                    <span>Rabat {order.couponCode ? `(${order.couponCode})` : ""}:</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif font-bold text-lg text-forest pt-2 border-t border-warm-gray mt-2">
                  <span>Razem:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
