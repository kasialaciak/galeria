"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { changePasswordSchema } from "@/lib/password";
import { checkThrottle, recordFailure, clearThrottle } from "@/lib/throttle";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export type ChangePasswordState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<NonNullable<ChangePasswordState>> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Musisz być zalogowany." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      error: "Popraw dane formularza.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const key = "pw:" + session.user.id;
  if (await checkThrottle(key)) {
    return { error: "Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut." };
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const ok = user?.password
      ? await bcrypt.compare(parsed.data.currentPassword, user.password)
      : false;

    if (!ok) {
      await recordFailure(key);
      return {
        error: "Obecne hasło jest nieprawidłowe.",
        fieldErrors: { currentPassword: ["Nieprawidłowe hasło"] },
      };
    }

    const hash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db
      .update(users)
      .set({ password: hash, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    await clearThrottle(key);

    return { success: true };
  } catch (e) {
    console.error("changePassword error:", e);
    return { error: "Wystąpił problem. Spróbuj ponownie za chwilę." };
  }
}
