"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { wishlists, products, productImages } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany, aby dodać do listy życzeń" };
  }

  const userId = session.user.id;

  try {
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
      )
      .limit(1);

    if (existing && existing.length > 0) {
      await db
        .delete(wishlists)
        .where(
          and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
        );
      revalidatePath("/lista-zyczen");
      return { success: true, isWishlisted: false };
    } else {
      await db.insert(wishlists).values({
        userId,
        productId,
      });

      // Zwiększ licznik wishlisty dla produktu
      await db
        .update(products)
        .set({
          addToWishlistCount: sql`${products.addToWishlistCount} + 1`,
        })
        .where(eq(products.id, productId));

      revalidatePath("/lista-zyczen");
      return { success: true, isWishlisted: true };
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: "Błąd podczas aktualizacji listy życzeń" };
  }
}

export async function removeFromWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, session.user.id),
          eq(wishlists.productId, productId)
        )
      );
    revalidatePath("/lista-zyczen");
    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false };
  }
}

export async function getWishlistItems() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const list = await db
      .select({
        id: products.id,
        namePl: products.namePl,
        nameEn: products.nameEn,
        slug: products.slug,
        descriptionPl: products.descriptionPl,
        descriptionEn: products.descriptionEn,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        stock: products.stock,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, session.user.id))
      .orderBy(desc(wishlists.createdAt));

    const images = await db.select().from(productImages);
    const imgMap = new Map<string, string>();
    for (const img of images) {
      if (!imgMap.has(img.productId)) {
        imgMap.set(img.productId, img.url);
      }
    }

    return list.map((item) => ({
      ...item,
      imageUrl: imgMap.get(item.id) || null,
    }));
  } catch (error) {
    console.warn("Could not query wishlist:", error);
    return [];
  }
}
