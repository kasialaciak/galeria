"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { registerSchema, loginSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";

export type AuthState = {
  success?: boolean;
  error?: string;
  fieldErrors?: { [key: string]: string[] };
};

export async function registerUser(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Niepoprawne dane formularza",
    };
  }

  const { name, email, password } = parsed.data;

  try {
    // Sprawdź czy użytkownik już istnieje
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "Użytkownik o tym adresie email już istnieje",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Wystąpił problem podczas rejestracji. Spróbuj ponownie za chwilę.",
    };
  }
}

export async function loginUser(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Wprowadź prawidłowy email i hasło",
    };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error: any) {
    // Pozwól przejść wyjątkom przekierowania Next.js
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Login error:", error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Nieprawidłowy adres email lub hasło",
          };
        default:
          return {
            success: false,
            error: "Wystąpił problem z logowaniem. Spróbuj ponownie za chwilę.",
          };
      }
    }

    return {
      success: false,
      error: "Nie udało się zalogować. Spróbuj ponownie za chwilę.",
    };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}
