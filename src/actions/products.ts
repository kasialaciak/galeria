"use server";

import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function incrementProductView(productId: string) {
  try {
    await db
      .update(products)
      .set({
        viewCount: sql`${products.viewCount} + 1`,
      })
      .where(eq(products.id, productId));
  } catch (error) {
    console.error("Failed to increment product view:", error);
  }
}

export async function incrementAddToCartCount(productId: string) {
  try {
    await db
      .update(products)
      .set({
        addToCartCount: sql`${products.addToCartCount} + 1`,
      })
      .where(eq(products.id, productId));
  } catch (error) {
    console.error("Failed to increment cart count:", error);
  }
}

export async function incrementWishlistCount(productId: string) {
  try {
    await db
      .update(products)
      .set({
        addToWishlistCount: sql`${products.addToWishlistCount} + 1`,
      })
      .where(eq(products.id, productId));
  } catch (error) {
    console.error("Failed to increment wishlist count:", error);
  }
}
