"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { productReviews, orders, orderItems } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ReviewItem {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
}

/**
 * Sprawdza, czy zalogowany użytkownik kupił ten produkt (zamówienie zrealizowane/opłacone)
 * oraz czy już dodał opinię.
 */
export async function canUserReviewProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      canReview: false,
      reason: "Musisz być zalogowany, aby dodać opinię.",
      isLoggedIn: false,
    };
  }

  try {
    // 1. Sprawdź, czy użytkownik ma zrealizowane/opłacone zamówienie z tym produktem
    const userOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.userId, session.user.id),
          inArray(orders.status, ["paid", "shipped", "delivered"])
        )
      );

    if (!userOrders || userOrders.length === 0) {
      return {
        canReview: false,
        reason: "Opinie mogą dodawać wyłącznie zweryfikowani klienci, którzy zakupili ten produkt.",
        isLoggedIn: true,
      };
    }

    const orderIds = userOrders.map((o) => o.id);
    const purchasedItem = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .where(
        and(
          inArray(orderItems.orderId, orderIds),
          eq(orderItems.productId, productId)
        )
      )
      .limit(1);

    if (!purchasedItem || purchasedItem.length === 0) {
      return {
        canReview: false,
        reason: "Opinie mogą dodawać wyłącznie klienci, którzy zakupili ten produkt.",
        isLoggedIn: true,
      };
    }

    // 2. Sprawdź, czy użytkownik już dodał opinię dla tego produktu
    const existingReview = await db
      .select({ id: productReviews.id })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingReview && existingReview.length > 0) {
      return {
        canReview: false,
        reason: "Dodałeś już opinię dla tego produktu. Dziękujemy!",
        isLoggedIn: true,
        alreadyReviewed: true,
      };
    }

    return {
      canReview: true,
      reason: null,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error("Error checking canUserReviewProduct:", error);
    return {
      canReview: false,
      reason: "Nie udało się zweryfikować uprawnień.",
      isLoggedIn: true,
    };
  }
}

/**
 * Dodaje opinię klienta (z walidacją zakupu i uprawnień)
 */
export async function addProductReviewAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany, aby dodać opinię." };
  }

  const productId = formData.get("productId") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const title = (formData.get("title") as string)?.trim() || null;
  const comment = (formData.get("comment") as string)?.trim();
  const userName = session.user.name || "Klient";

  if (!productId || isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Wybierz ocenę od 1 do 5 gwiazdek." };
  }

  if (!comment || comment.length < 5) {
    return { success: false, error: "Opinia musi zawierać minimum 5 znaków." };
  }

  // Weryfikacja po stronie serwera przed dodaniem
  const eligibility = await canUserReviewProduct(productId);
  if (!eligibility.canReview) {
    return { success: false, error: eligibility.reason || "Brak uprawnień do wystawienia opinii." };
  }

  try {
    await db.insert(productReviews).values({
      productId,
      userId: session.user.id,
      userName,
      rating,
      title,
      comment,
      isApproved: true,
    });

    revalidatePath(`/produkty`);
    revalidatePath(`/admin/opinie`);

    return { success: true };
  } catch (error) {
    console.error("Error adding product review:", error);
    return { success: false, error: "Wystąpił błąd podczas dodawania opinii." };
  }
}

/**
 * Pobiera zatwierdzone opinie danego produktu wraz z wyliczoną średnią
 */
export async function getProductReviews(productId: string) {
  try {
    const list = await db
      .select()
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.isApproved, true)
        )
      )
      .orderBy(desc(productReviews.createdAt));

    const total = list.length;
    const average =
      total > 0
        ? Number((list.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
        : 0;

    return {
      reviews: list,
      total,
      average,
    };
  } catch (error) {
    console.warn("Could not get product reviews:", error);
    return {
      reviews: [],
      total: 0,
      average: 0,
    };
  }
}

/**
 * Pobiera wszystkie opinie dla panelu administratora
 */
export async function getAdminReviewsList() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") return [];

  try {
    const list = await db
      .select()
      .from(productReviews)
      .orderBy(desc(productReviews.createdAt));

    return list;
  } catch (error) {
    console.warn("Could not get admin reviews:", error);
    return [];
  }
}

/**
 * Usunięcie opinii przez administratora
 */
export async function deleteReviewAction(reviewId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Brak uprawnień" };
  }

  try {
    await db.delete(productReviews).where(eq(productReviews.id, reviewId));
    revalidatePath("/admin/opinie");
    revalidatePath("/produkty");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Nie udało się usunąć opinii" };
  }
}

/**
 * Przełączenie widoczności opinii przez administratora
 */
export async function toggleReviewApprovalAction(reviewId: string, currentStatus: boolean) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Brak uprawnień" };
  }

  try {
    await db
      .update(productReviews)
      .set({ isApproved: !currentStatus })
      .where(eq(productReviews.id, reviewId));

    revalidatePath("/admin/opinie");
    revalidatePath("/produkty");
    return { success: true };
  } catch (error) {
    console.error("Error toggling review approval:", error);
    return { success: false, error: "Nie udało się zmienić statusu opinii" };
  }
}
