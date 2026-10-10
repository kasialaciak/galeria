"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { orders, orderItems, users, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/email/mailer";
import { orderAcceptedEmail, orderShippedEmail, orderDelayedEmail, orderProcessingEmail, orderCompletedEmail, orderDeliveredEmail, orderRejectedEmail } from "@/lib/email/templates";
import { stripe } from "@/lib/stripe";
import { getSettings } from "@/lib/settings";

export async function getAllAdminOrders() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") return [];

  try {
    const list = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        shippingName: orders.shippingName,
        shippingCity: orders.shippingCity,
        shippingAddress: orders.shippingAddress,
        shippingPostalCode: orders.shippingPostalCode,
        shippingMethod: orders.shippingMethod,
        shippingPhone: orders.shippingPhone,
        shippingPaczkomat: orders.shippingPaczkomat,
        shippingCost: orders.shippingCost,
        stripeSessionId: orders.stripeSessionId,
        createdAt: orders.createdAt,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    const items = await db.select().from(orderItems);
    const itemsMap = new Map<string, any[]>();
    for (const it of items) {
      if (!itemsMap.has(it.orderId)) {
        itemsMap.set(it.orderId, []);
      }
      itemsMap.get(it.orderId)!.push(it);
    }

    return list.map((ord) => ({
      ...ord,
      items: itemsMap.get(ord.id) || [],
    }));
  } catch (error) {
    console.warn("Could not query admin orders:", error);
    return [];
  }
}

export async function updateOrderStatusAction(orderId: string, status: string, extraData?: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Brak uprawnień" };
  }

  try {
    const [orderData] = await db
      .select({ order: orders, userEmail: users.email })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId));
      
    const order = orderData?.order;
    if (!order) return { success: false, error: "Nie znaleziono zamówienia" };

    const emailTo = orderData?.userEmail || "brak_emaila";
    const locale = (order.locale as "pl" | "en") || "pl";

    if (status === "cancelled" && order.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        });
      } catch (refundError: any) {
        console.error("Stripe refund error:", refundError);
        return { success: false, error: "Błąd podczas zwracania środków przez Stripe: " + refundError.message };
      }
    }

    // 1. Zmiana statusu
    await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // 2. Automatyczne maile
    if (status === "accepted" && emailTo !== "brak_emaila") {
      const settings = await getSettings();
      const mail = orderAcceptedEmail({
        orderNumber: order.orderNumber,
        name: order.shippingName || "Kliencie",
        days: settings.shippingDays,
        locale,
      });
      await sendMail({ to: emailTo, ...mail });
    } else if (status === "processing" && emailTo !== "brak_emaila") {
      const mail = orderProcessingEmail({
        orderNumber: order.orderNumber,
        name: order.shippingName || "Kliencie",
        locale,
      });
      await sendMail({ to: emailTo, ...mail });
    } else if (status === "completed" && emailTo !== "brak_emaila") {
      const mail = orderCompletedEmail({
        orderNumber: order.orderNumber,
        name: order.shippingName || "Kliencie",
        locale,
      });
      await sendMail({ to: emailTo, ...mail });
    } else if (status === "shipped" && emailTo !== "brak_emaila") {
      const mail = orderShippedEmail({
        orderNumber: order.orderNumber,
        name: order.shippingName || "Kliencie",
        trackingUrl: extraData,
        locale,
      });
      await sendMail({ to: emailTo, ...mail });
    } else if (status === "delivered" && emailTo !== "brak_emaila") {
      const mail = orderDeliveredEmail({
        orderNumber: order.orderNumber,
        name: order.shippingName || "Kliencie",
        locale,
      });
      await sendMail({ to: emailTo, ...mail });
    } else if (status === "cancelled" && emailTo !== "brak_emaila") {
      const mail = orderRejectedEmail({
        orderNumber: order.orderNumber,
        name: order.shippingName || "Kliencie",
        reason: extraData || "Anulowane przez administratora.",
        locale,
      });
      await sendMail({ to: emailTo, ...mail });
    }

    revalidatePath("/admin/zamowienia");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Błąd aktualizacji statusu zamówienia" };
  }
}

export async function sendDelayEmailAction(orderId: string, message: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Brak uprawnień" };
  }

  try {
    const [orderData] = await db
      .select({ order: orders, userEmail: users.email })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId));
      
    const order = orderData?.order;
    if (!order) return { success: false, error: "Nie znaleziono zamówienia" };
    
    const emailTo = orderData?.userEmail;
    if (!emailTo) return { success: false, error: "Zamówienie nie ma przypisanego adresu email" };

    const locale = (order.locale as "pl" | "en") || "pl";

    const mail = orderDelayedEmail({
      orderNumber: order.orderNumber,
      name: order.shippingName || "Kliencie",
      message,
      locale,
    });
    
    await sendMail({ to: emailTo, ...mail });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending delay email:", error);
    return { success: false, error: "Wystąpił błąd podczas wysyłania e-maila." };
  }
}
export async function getAdminOrderById(orderId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return null;

  try {
    const [orderData] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        shippingName: orders.shippingName,
        shippingCity: orders.shippingCity,
        shippingAddress: orders.shippingAddress,
        shippingPostalCode: orders.shippingPostalCode,
        shippingCountry: orders.shippingCountry,
        shippingMethod: orders.shippingMethod,
        shippingPhone: orders.shippingPhone,
        shippingPaczkomat: orders.shippingPaczkomat,
        shippingCost: orders.shippingCost,
        stripeSessionId: orders.stripeSessionId,
        createdAt: orders.createdAt,
        customerNotes: orders.customerNotes,
        couponCode: orders.couponCode,
        discountAmount: orders.discountAmount,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId));

    if (!orderData) return null;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        productName: orderItems.productName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        variantLabel: orderItems.variantLabel,
        workTime: products.workTime,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      ...orderData,
      items,
    };
  } catch (error) {
    console.warn('Could not query admin order by id:', error);
    return null;
  }
}
