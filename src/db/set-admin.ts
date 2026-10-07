import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import crypto from "crypto";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("placeholder")) {
    console.error("Błąd: DATABASE_URL nie jest ustawiony poprawnie.");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  const adminEmail = "cosmic.loop.core@gmail.com";
  const password = crypto.randomBytes(12).toString("base64url");
  const hashedPassword = await bcrypt.hash(password, 12);

  // 1. Stwórz / aktualizuj admina
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1);

  if (existing) {
    await db
      .update(schema.users)
      .set({ password: hashedPassword, role: "admin" })
      .where(eq(schema.users.id, existing.id));
    console.log("Konto admina już istniało. Zaktualizowano hasło.");
  } else {
    await db.insert(schema.users).values({
      name: "Cosmic Loop Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log("Utworzono nowe konto admina.");
  }

  // 2. Obsłuż stare konto admina
  const oldEmail = "admin@rekodzielo.pl";
  const [oldAdmin] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, oldEmail))
    .limit(1);

  if (oldAdmin) {
    // Sprawdzamy czy ma zamówienia
    const orders = await db
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.userId, oldAdmin.id))
      .limit(1);
      
    if (orders.length > 0) {
      // Ma zamówienia - degradujemy
      const randomPw = crypto.randomBytes(12).toString("base64url");
      const randomHash = await bcrypt.hash(randomPw, 12);
      await db
        .update(schema.users)
        .set({ role: "user", password: randomHash })
        .where(eq(schema.users.id, oldAdmin.id));
      console.log("Stare konto admina zdegradowano do 'user'.");
    } else {
      // Nie ma zamówień - usuwamy
      await db.delete(schema.users).where(eq(schema.users.id, oldAdmin.id));
      console.log("Stare konto admina usunięte.");
    }
  }

  console.log("\n==================================================");
  console.log("Konto admina: " + adminEmail);
  console.log("Hasło (zapisz i zmień po zalogowaniu): " + password);
  console.log("==================================================\n");

  process.exit(0);
}

main().catch((e) => {
  console.error("Błąd podczas operacji:", e);
  process.exit(1);
});
