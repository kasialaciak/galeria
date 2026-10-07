"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminCoupons() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") return [];
  
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function createCouponAction(prevState: any, formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") return { success: false, error: "Brak uprawnień" };

  const code = (formData.get("code") as string).toUpperCase();
  const type = formData.get("type") as string;
  const value = parseFloat(formData.get("value") as string);
  const minOrderAmount = parseFloat(formData.get("minOrderAmount") as string) || 0;
  
  if (!code || !type || !value) return { success: false, error: "Wypełnij wymagane pola" };
  
  try {
    await db.insert(coupons).values({
      code,
      type,
      value: type === "fixed" ? value * 100 : value,
      minOrderAmount: minOrderAmount * 100,
    });
    revalidatePath("/admin/ustawienia/kupony");
    return { success: true };
  } catch (e: any) {
    if (e.code === "23505") return { success: false, error: "Kupon o takim kodzie już istnieje" };
    return { success: false, error: "Błąd bazy danych" };
  }
}

export async function deleteCouponAction(id: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") return { success: false, error: "Brak uprawnień" };

  try {
    await db.delete(coupons).where(eq(coupons.id, id));
    revalidatePath("/admin/ustawienia/kupony");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Błąd bazy danych" };
  }
}
