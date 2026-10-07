import { getAllAdminOrders } from "@/actions/admin-orders";
import { formatPrice, getRemainingBusinessDays } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OrderStatusSelector } from "./order-status-selector";
import { Package, Clock } from "lucide-react";

export default async function AdminOrdersPage() {
  const orderList = await getAllAdminOrders();
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-warm-gray">
        <h1 className="font-serif text-3xl font-bold text-forest">
          Zarządzanie Zamówieniami
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Przeglądaj zamówienia klientów i aktualizuj ich statusy realizacji ({orderList.length})
        </p>
      </div>

      <Card className="bg-white border-warm-gray shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {orderList.length === 0 ? (
            <div className="p-12 text-center text-charcoal/60 space-y-3">
              <Package className="h-10 w-10 mx-auto text-charcoal/30" />
              <p className="text-sm font-medium">Brak zamówień w bazie</p>
              <p className="text-xs text-charcoal/50">
                Gdy klienci opłacą zakupy przez Stripe, zamówienia pojawią się w tym miejscu.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/60 text-charcoal/70 uppercase tracking-wider border-b border-warm-gray font-semibold">
                  <tr>
                    <th className="p-4">Numer i data</th>
                    <th className="p-4">Klient i adres</th>
                    <th className="p-4">Dostawa</th>
                    <th className="p-4">Produkty</th>
                    <th className="p-4">Kwota</th>
                    <th className="p-4">Status zamówienia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-gray/60">
                  {orderList.map((ord: any) => {
                    const isFinished = ["shipped", "delivered", "cancelled"].includes(ord.status);
                    const maxDays = parseInt(settings.shippingDays) || 21;
                    const remainingDays = getRemainingBusinessDays(ord.createdAt, maxDays, settings.holidayDates);
                    const isDelayed = remainingDays < 0;
                    
                    return (
                      <tr key={ord.id} className="hover:bg-cream/20 transition-colors">
                        <td className="p-4 align-top">
                          <span className="font-mono font-bold text-charcoal block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-charcoal/50 block">
                            {new Date(ord.createdAt).toLocaleDateString("pl-PL")}
                          </span>
                          {!isFinished && (
                            <div className={`mt-2 flex items-center gap-1 font-medium ${isDelayed ? 'text-red-500' : remainingDays <= 5 ? 'text-orange-500' : 'text-forest'}`}>
                              <Clock className="w-3 h-3" />
                              <span className="text-[10px]">
                                {isDelayed ? `Opóźnienie: ${Math.abs(remainingDays)} dni` : `Pozostało: ${remainingDays} dni`}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-4 align-top">
                          <p className="font-semibold text-charcoal">{ord.shippingName}</p>
                          <p className="text-charcoal/60">{ord.shippingCity}, {ord.shippingAddress}</p>
                          {ord.shippingPhone && (
                            <p className="text-charcoal/60">Tel: {ord.shippingPhone}</p>
                          )}
                          {ord.userEmail && (
                            <p className="text-charcoal/50 font-mono text-[10px]">{ord.userEmail}</p>
                          )}
                        </td>

                        <td className="p-4 align-top">
                          <span className="capitalize font-medium text-charcoal">{ord.shippingMethod}</span>
                          {ord.shippingPaczkomat && (
                            <p className="text-xs font-bold text-forest">{ord.shippingPaczkomat}</p>
                          )}
                          <p className="text-charcoal/50">{formatPrice(ord.shippingCost)}</p>
                        </td>

                        <td className="p-4 align-top">
                          <div className="space-y-1">
                            {ord.items && ord.items.length > 0 ? (
                              ord.items.map((it: any) => (
                                <p key={it.id} className="text-charcoal/80">
                                  {it.quantity}x {it.productName} ({formatPrice(it.unitPrice)})
                                </p>
                              ))
                            ) : (
                              <span className="text-charcoal/40">Szczegóły w sesji Stripe</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 align-top font-serif font-bold text-forest text-sm">
                          {formatPrice(ord.totalAmount)}
                        </td>

                        <td className="p-4 align-top">
                          <OrderStatusSelector
                            orderId={ord.id}
                            currentStatus={ord.status}
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
