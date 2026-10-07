import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { authConfig } from "./auth.config";
import { db } from "@/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";
import { loginSchema } from "@/lib/validators";
import { checkThrottle, recordFailure, clearThrottle } from "@/lib/throttle";

// Atrapa hasha – porównanie wykonujemy zawsze, żeby czas odpowiedzi nie zdradzał,
// czy konto o danym adresie istnieje.
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5xRZ0hYxXQmZ3rJXJ1uWk8m9n7s3E5K";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const throttleKey = "login:" + email.toLowerCase();

        if (await checkThrottle(throttleKey)) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        const passwordsMatch = await bcrypt.compare(
          password,
          user?.password || DUMMY_HASH
        );

        if (!user || !user.password || !passwordsMatch) {
          await recordFailure(throttleKey);
          return null;
        }

        await clearThrottle(throttleKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
