"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { orders, orderItems, products, coupons } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validators";
import { and, inArray, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";

interface CartInputItem {
  productId: string;
  quantity: number;
}

const SHIPPING_COSTS: Record<string, number> = {
  kurier: 1500,     // 15.00 PLN w groszach
  paczkomat: 1200,  // 12.00 PLN w groszach
  odbior: 0,        // 0.00 PLN
  eu_courier: 6000, // 60.00 PLN w groszach
};

export async function createCheckoutSession(
  formData: FormData,
  cartItems: CartInputItem[]
) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user?.id) {
    return { error: "Musisz być zalogowany, aby sfinalizować zamówienie." };
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: "Twój koszyk jest pusty." };
  }

  const rawData = {
    shippingName: formData.get("shippingName"),
    shippingAddress: (formData.get("shippingAddress") as string)?.trim() || "",
    shippingCity: (formData.get("shippingCity") as string)?.trim() || "",
    shippingPostalCode: (formData.get("shippingPostalCode") as string)?.trim() || "",
    shippingCountry: formData.get("shippingCountry") || "PL",
    shippingMethod: formData.get("shippingMethod"),
    shippingPhone: formData.get("shippingPhone"),
    shippingPaczkomat: (formData.get("shippingPaczkomat") as string)?.trim() || undefined,
  };
  
  const couponCode = formData.get("couponCode") as string | null;
  const customerNotes = formData.get("customerNotes") as string | null;
  const shippingEmail = formData.get("shippingEmail") as string | null;

  const parsed = checkoutSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Uzupełnij poprawnie wszystkie dane do wysyłki.",
    };
  }

  const { shippingMethod, ...shippingDetails } = parsed.data;
  const shippingCost = SHIPPING_COSTS[shippingMethod] ?? 1500;

  // W przypadku odbioru osobistego, jeśli użytkownik nie podał adresu, ustawiamy wartości domyślne dla bazy
  const finalShippingAddress = shippingMethod === "odbior" && !shippingDetails.shippingAddress
    ? "Odbiór osobisty w punkcie sprzedaży"
    : shippingDetails.shippingAddress;
  const finalShippingCity = shippingMethod === "odbior" && !shippingDetails.shippingCity
    ? "Punkt sprzedaży"
    : shippingDetails.shippingCity;
  const finalShippingPostalCode = shippingMethod === "odbior" && !shippingDetails.shippingPostalCode
    ? "00-000"
    : shippingDetails.shippingPostalCode;
  const finalShippingPaczkomat = shippingMethod === "paczkomat"
    ? shippingDetails.shippingPaczkomat ?? null
    : null;

  try {
    const productIds = cartItems.map((i) => i.productId);
    const dbProducts = await db
      .select({
        id: products.id,
        namePl: products.namePl,
        price: products.price,
      })
      .from(products)
      .where(and(inArray(products.id, productIds), eq(products.isPublished, true)));

    const verifiedItems = [];
    let itemsTotalAmount = 0;

    for (const input of cartItems) {
      if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
        return { error: "Nieprawidłowa ilość produktu w koszyku." };
      }
      
      const dbProd = dbProducts.find((p) => p.id === input.productId);
      if (dbProd) {
        verifiedItems.push({
          productId: dbProd.id,
          productName: dbProd.namePl,
          unitPrice: dbProd.price,
          quantity: input.quantity,
        });
        itemsTotalAmount += dbProd.price * input.quantity;
      }
    }

    if (verifiedItems.length === 0) {
      return { error: "Brak dostępnych produktów w koszyku." };
    }

    // Walidacja kuponu
    let discountCents = 0;
    let validCouponCode: string | null = null;
    let couponId: string | null = null;
    
    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.toUpperCase()))
        .limit(1);

      if (coupon && coupon.isActive && 
         (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) && 
         (!coupon.maxUses || coupon.usedCount < coupon.maxUses) && 
         itemsTotalAmount >= coupon.minOrderAmount) 
      {
        if (coupon.type === "percent") {
          discountCents = Math.floor(itemsTotalAmount * (coupon.value / 100));
        } else if (coupon.type === "fixed") {
          discountCents = coupon.value;
        }
        discountCents = Math.min(discountCents, itemsTotalAmount);
        validCouponCode = coupon.code;
        couponId = coupon.id;
      }
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 1000
    )}`;

    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: session.user.id,
        status: "pending",
        totalAmount: itemsTotalAmount - discountCents + shippingCost,
        shippingName: shippingDetails.shippingName,
        shippingAddress: finalShippingAddress,
        shippingCity: finalShippingCity,
        shippingPostalCode: finalShippingPostalCode,
        shippingCountry: shippingDetails.shippingCountry,
        shippingMethod,
        shippingPhone: shippingDetails.shippingPhone,
        shippingPaczkomat: finalShippingPaczkomat,
        shippingCost,
        couponCode: validCouponCode,
        discountAmount: discountCents,
        customerNotes,
        termsAcceptedAt: new Date(),
        locale,
      })
      .returning({ id: orders.id });

    const orderId = newOrder.id;

    await db.insert(orderItems).values(
      verifiedItems.map((item) => ({
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Proporcjonalne rozłożenie zniżki na produkty, by zgadzało się ze Stripe.
    let remainingDiscount = discountCents;
    const stripeLineItems = verifiedItems.map((item, index) => {
      let itemDiscount = 0;
      if (discountCents > 0) {
        if (index === verifiedItems.length - 1) {
          itemDiscount = remainingDiscount; // reszta na ostatni produkt
        } else {
          itemDiscount = Math.floor(discountCents * ((item.unitPrice * item.quantity) / itemsTotalAmount));
          remainingDiscount -= itemDiscount;
        }
      }
      
      const discountedUnitPrice = Math.max(0, item.unitPrice - Math.floor(itemDiscount / item.quantity));
      
      return {
        price_data: {
          currency: "pln",
          product_data: { name: item.productName },
          unit_amount: discountedUnitPrice,
        },
        quantity: item.quantity,
      };
    });

    if (shippingCost > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "pln",
          product_data: { name: `Dostawa: ${shippingMethod}` },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      line_items: stripeLineItems,
      mode: "payment",
      customer_email: shippingEmail || session.user.email || undefined,
      success_url: `${appUrl}/zamowienie/sukces?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${appUrl}/koszyk`,
      metadata: {
        orderId,
        orderNumber,
        userId: session.user.id,
        couponId: couponId || "",
      }
    });

    await db
      .update(orders)
      .set({ stripeSessionId: stripeSession.id })
      .where(eq(orders.id, orderId));

    return {
      success: true,
      checkoutUrl: stripeSession.url,
    };
  } catch (error) {
    console.error("Checkout action error:", error);
    return {
      error: "Wystąpił problem podczas tworzenia zamówienia. Spróbuj ponownie za chwilę.",
    };
  }
}
