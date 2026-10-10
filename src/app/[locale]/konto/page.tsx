import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { getUserOrders } from "@/actions/orders";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountProfileForm } from "./account-profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { LogoutButton } from "./logout-button";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { User, Package, Shield, ExternalLink, Lock } from "lucide-react";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("Account");

  if (!session?.user?.id) {
    redirect({ href: "/konto/logowanie", locale });
    return null;
  }

  const sessionUser = session.user;

  let dbUser: any = null;
  try {
    const [u] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    dbUser = u;
  } catch (e) {
    // fallback
  }

  const currentUser = dbUser || {
    name: sessionUser.name || "Użytkownik",
    email: sessionUser.email || "",
    phone: "",
    role: (sessionUser as any).role || "user",
  };

  const userOrders = await getUserOrders();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="secondary">{t("statusPaid")}</Badge>;
      case "shipped":
        return <Badge variant="default">{t("statusShipped")}</Badge>;
      case "delivered":
        return <Badge variant="sage">{t("statusDelivered")}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t("statusCancelled")}</Badge>;
      default:
        return <Badge variant="outline">{t("statusPending")}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-gray">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            {t("title")}
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            {t("loggedInAs")} <strong className="text-charcoal">{currentUser.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === "admin" && (
            <Button asChild variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
              <Link href="/admin" className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                <span>{t("adminPanel")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Lewa kolumna: Dane osobowe i bezpieczeństwo */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border-warm-gray shadow-xs">
            <CardHeader className="border-b border-warm-gray pb-4">
              <CardTitle className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                <User className="h-4 w-4 text-forest" />
                {t("profile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AccountProfileForm user={currentUser} />
            </CardContent>
          </Card>

          <Card className="bg-white border-warm-gray shadow-xs">
            <CardHeader className="border-b border-warm-gray pb-4">
              <CardTitle className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                <Lock className="h-4 w-4 text-forest" />
                {t("security")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>

        {/* Prawa kolumna: Historia zamówień */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-warm-gray shadow-xs">
            <CardHeader className="border-b border-warm-gray pb-4">
              <CardTitle className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                <Package className="h-4 w-4 text-forest" />
                {t("orderHistory")} ({userOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {userOrders.length === 0 ? (
                <div className="py-12 text-center text-charcoal/60 space-y-3">
                  <Package className="h-10 w-10 mx-auto text-charcoal/30" />
                  <p className="text-sm font-medium">{t("noOrders")}</p>
                  <Button asChild size="sm" className="bg-forest hover:bg-forest/90 text-white">
                    <Link href="/produkty">{t("discoverProducts")}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-warm-gray bg-cream/30 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warm-gray/60 pb-2 text-xs">
                        <span className="font-mono font-bold text-charcoal">
                          {order.orderNumber}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-charcoal/50">
                            {new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "pl-PL")}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="flex justify-between items-baseline pt-1">
                        <div>
                          <p className="text-xs text-charcoal/60">
                            {t("shipping")} <span className="font-medium text-charcoal">{order.shippingMethod}</span>
                          </p>
                          <p className="text-xs text-charcoal/60">
                            {t("addressLabel")} {order.shippingCity}, {order.shippingAddress}
                          </p>
                        </div>
                        <span className="font-serif text-lg font-bold text-forest">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
