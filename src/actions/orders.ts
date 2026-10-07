"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserOrders() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt));

    if (!userOrders || userOrders.length === 0) return [];

    const orderIds = userOrders.map((o) => o.id);
    const items = await db.select().from(orderItems).where(
      inArray(orderItems.orderId, orderIds)
    );

    const itemsMap = new Map<string, any[]>();
    for (const item of items) {
      if (!itemsMap.has(item.orderId)) {
        itemsMap.set(item.orderId, []);
      }
      itemsMap.get(item.orderId)!.push(item);
    }

    return userOrders.map((order) => ({
      ...order,
      items: itemsMap.get(order.id) || [],
    }));
  } catch (error) {
    console.warn("Could not query user orders:", error);
    return [];
  }
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Brak autoryzacji" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name || name.trim().length < 2) {
    return { success: false, error: "Imię musi mieć minimum 2 znaki" };
  }

  try {
    await db
      .update(users)
      .set({
        name: name.trim(),
        phone: phone?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/konto");
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Wystąpił błąd podczas aktualizacji danych" };
  }
}
