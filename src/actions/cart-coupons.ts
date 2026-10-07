"use server";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function validateCouponCode(code: string, cartTotalCents: number) {
  if (!code) return { success: false, error: "Pusty kod rabatowy" };
  if (cartTotalCents <= 0) return { success: false, error: "Nieprawidłowa kwota koszyka" };

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);

  if (!coupon) return { success: false, error: "Nieprawidłowy kod rabatowy" };

  if (!coupon.isActive) return { success: false, error: "Ten kupon jest nieaktywny" };

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { success: false, error: "Kupon wygasł" };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { success: false, error: "Limit użyć kuponu został wyczerpany" };
  }

  if (cartTotalCents < coupon.minOrderAmount) {
    return { success: false, error: `Minimalna kwota zamówienia dla tego kuponu to ${(coupon.minOrderAmount / 100).toFixed(2)} zł` };
  }

  // Obliczamy zniżkę
  let discountCents = 0;
  if (coupon.type === "percent") {
    discountCents = Math.floor(cartTotalCents * (coupon.value / 100));
  } else if (coupon.type === "fixed") {
    discountCents = coupon.value;
  }

  // Zniżka nie może przekroczyć wartości koszyka (żeby nie było ujemnych)
  discountCents = Math.min(discountCents, cartTotalCents);

  return {
    success: true,
    coupon: {
      code: coupon.code,
      discountCents,
      type: coupon.type,
      value: coupon.value,
    }
  };
}
