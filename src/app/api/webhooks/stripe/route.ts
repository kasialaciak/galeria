import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { db } from "@/db";
import { orders, coupons } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/email/mailer";
import { adminNewOrderEmail } from "@/lib/email/templates";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Brak sygnatury lub sekretu webhooka" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Błąd weryfikacji sygnatury Stripe: ${err.message}`);
    return NextResponse.json({ error: "Nieprawidłowy podpis" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const paymentIntentId = session.payment_intent as string;
      const couponId = session.metadata?.couponId;

      if (orderId) {
        try {
          await db
            .update(orders)
            .set({
              status: "paid",
              stripePaymentIntentId: paymentIntentId,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

          console.log(`Zamówienie ${orderId} zostało opłacone.`);

          if (couponId) {
            await db.update(coupons).set({
              usedCount: sql`${coupons.usedCount} + 1`
            }).where(eq(coupons.id, couponId));
          }

          try {
            const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
            if (order) {
              const settings = await getSettings();
              const adminEmail = settings.contactEmail || "cosmic.loop.core+shoop@gmail.com";
              const mail = adminNewOrderEmail({
                orderNumber: order.orderNumber,
                totalStr: formatPrice(order.totalAmount),
              });
              await sendMail({ to: adminEmail, ...mail });
            }
          } catch (mailErr) {
            console.error("Błąd wysyłania powiadomienia e-mail do admina:", mailErr);
          }
        } catch (dbErr) {
          console.error(`Błąd aktualizacji bazy dla zamówienia ${orderId}:`, dbErr);
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.warn("Płatność nie powiodła się:", paymentIntent.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
