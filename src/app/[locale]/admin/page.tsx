import { getAdminStats } from "@/actions/stats";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Eye,
  ShoppingBag,
  Heart,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  Plus,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const statCards = [
    {
      title: "Liczba wyświetleń",
      value: stats.totalViews.toLocaleString("pl-PL"),
      description: "Łączna liczba odsłon produktów",
      icon: Eye,
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      title: "Dodania do koszyka",
      value: stats.totalCartAdds.toLocaleString("pl-PL"),
      description: "Przedmioty włożone do koszyka",
      icon: ShoppingBag,
      color: "text-forest",
      bg: "bg-forest/10",
    },
    {
      title: "Dodania do listy życzeń",
      value: stats.totalWishlistAdds.toLocaleString("pl-PL"),
      description: "Zachowane przez klientów serduszkiem",
      icon: Heart,
      color: "text-clay",
      bg: "bg-clay/10",
    },
    {
      title: "Liczba zamówień",
      value: stats.totalOrders.toLocaleString("pl-PL"),
      description: "Złożone zamówienia w sklepie",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Łączny przychód",
      value: formatPrice(stats.totalRevenue),
      description: "Opłacone zamówienia klientów",
      icon: DollarSign,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      title: "Aktywne produkty",
      value: stats.totalProducts.toLocaleString("pl-PL"),
      description: "Pozycje w katalogu rękodzieła",
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Nagłówek pulpitu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-gray">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest">
            Pulpit Sklepu
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Podsumowanie statystyk, sprzedaży i aktywności w sklepie rękodzieła
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="bg-forest hover:bg-forest/90 text-white text-xs h-9">
            <Link href="/admin/produkty/nowy" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Dodaj nowy produkt</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Siatka 6 kart statystyk wymaganych przez użytkownika */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="bg-white border-warm-gray shadow-xs">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal/70">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <span className="font-serif text-3xl font-bold text-charcoal">
                    {card.value}
                  </span>
                  <p className="text-[11px] text-charcoal/50 mt-1">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ostatnie zamówienia */}
      <Card className="bg-white border-warm-gray shadow-xs">
        <CardHeader className="border-b border-warm-gray pb-4 flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg font-bold text-forest">
            Ostatnie zamówienia
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-forest">
            <Link href="/admin/zamowienia">Wszystkie zamówienia →</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="divide-y divide-warm-gray/60">
              {stats.recentOrders.map((ord: any) => (
                <div key={ord.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-charcoal">{ord.orderNumber}</span>
                    <p className="text-charcoal/50 mt-0.5">{ord.shippingName} • {ord.shippingCity}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-serif text-forest">{formatPrice(ord.totalAmount)}</span>
                    <div className="mt-0.5">
                      <Badge variant={ord.status === "paid" ? "secondary" : "outline"} className="text-[10px]">
                        {ord.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-charcoal/50">
              Brak jeszcze zamówień w bazie danych. Gdy klienci dokonają zakupu, pojawią się tutaj.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
