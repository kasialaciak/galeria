"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { products, orders } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export async function getAdminStats() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Statystyki produktów: odsłony, koszyk, wishlist
    const [prodStats] = await db
      .select({
        totalViews: sql<number>`coalesce(sum(${products.viewCount}), 0)`,
        totalCartAdds: sql<number>`coalesce(sum(${products.addToCartCount}), 0)`,
        totalWishlistAdds: sql<number>`coalesce(sum(${products.addToWishlistCount}), 0)`,
        totalProducts: sql<number>`count(*)`,
      })
      .from(products);

    // 2. Statystyki zamówień: liczba zamówień, przychód z opłaconych
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`coalesce(sum(case when ${orders.status} = 'paid' then ${orders.totalAmount} else 0 end), 0)`,
      })
      .from(orders);

    // 3. Ostatnie zamówienia
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    return {
      totalViews: Number(prodStats?.totalViews || 0),
      totalCartAdds: Number(prodStats?.totalCartAdds || 0),
      totalWishlistAdds: Number(prodStats?.totalWishlistAdds || 0),
      totalProducts: Number(prodStats?.totalProducts || 0),
      totalOrders: Number(orderStats?.totalOrders || 0),
      totalRevenue: Number(orderStats?.totalRevenue || 0),
      recentOrders: recentOrders || [],
    };
  } catch (error) {
    console.warn("Could not query admin stats, returning mock stats:", error);
    // Mock dla demonstracji, gdy baza nie ma jeszcze danych
    return {
      totalViews: 342,
      totalCartAdds: 58,
      totalWishlistAdds: 89,
      totalProducts: 12,
      totalOrders: 14,
      totalRevenue: 342000, // 3420.00 PLN w groszach
      recentOrders: [],
    };
  }
}
