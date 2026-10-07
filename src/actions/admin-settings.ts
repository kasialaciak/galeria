"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { siteSettings, users } from "@/db/schema";
import { settingsSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export type AdminSettingsState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function updateSettings(
  _prev: AdminSettingsState,
  formData: FormData
): Promise<NonNullable<AdminSettingsState>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Brak uprawnień." };
  }

  // verify admin role
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (user?.role !== "admin") {
    return { error: "Brak uprawnień." };
  }

  const rawData = {
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    instagramUrl: formData.get("instagramUrl"),
    sellerName: formData.get("sellerName"),
    sellerAddress: formData.get("sellerAddress"),
    sellerNip: formData.get("sellerNip"),
    shippingDays: formData.get("shippingDays"),
    holidayDates: formData.get("holidayDates"),
    storeEnabled: formData.get("storeEnabled") || "false",
  };

  const parsed = settingsSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      error: "Popraw błędy w formularzu.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    for (const [key, value] of Object.entries(parsed.data)) {
      await db
        .insert(siteSettings)
        .values({ key, value: value || "", updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: value || "", updatedAt: new Date() },
        });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("updateSettings error:", error);
    return { error: "Wystąpił problem podczas zapisywania ustawień." };
  }
}
