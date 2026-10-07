import { categories, products } from "./schema";
import { eq, like, inArray } from "drizzle-orm";
import crypto from "crypto";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("No DATABASE_URL");
  const sql = neon(connectionString);
  const db = drizzle(sql);

  console.log("Rozpoczynanie migracji asortymentu...");

  // 1. Kategoria główna Szydełko
  const szydelkoId = crypto.randomUUID();
  await db
    .insert(categories)
    .values({
      id: szydelkoId,
      namePl: "Szydełko",
      nameEn: "Crochet",
      slug: "szydelko",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: { namePl: "Szydełko", nameEn: "Crochet" },
    });

  const [szydelkoRow] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, "szydelko"));
  const parentId = szydelkoRow.id;

  // 2. Podkategorie szydełka
  const subcats = [
    { namePl: "Pluszaki", nameEn: "Plushies", slug: "pluszaki" },
    { namePl: "Breloczki", nameEn: "Keychains", slug: "breloczki" },
    { namePl: "Gumki do włosów", nameEn: "Scrunchies", slug: "gumki-do-wlosow" },
    { namePl: "Torebki", nameEn: "Bags", slug: "torebki" },
  ];

  for (const c of subcats) {
    await db
      .insert(categories)
      .values({
        id: crypto.randomUUID(),
        namePl: c.namePl,
        nameEn: c.nameEn,
        slug: c.slug,
        parentId,
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { namePl: c.namePl, nameEn: c.nameEn, parentId },
      });
  }

  // 3. Update Biżuteria
  await db
    .update(categories)
    .set({ namePl: "Biżuteria z modeliny i gliny", nameEn: "Polymer & Clay Jewelry" })
    .where(eq(categories.slug, "bizuteria"));

  // 5. Tkaniny -> null, a potem usuń
  const [tkaninyRow] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, "tkaniny"));
  if (tkaninyRow) {
    await db.update(products).set({ categoryId: parentId }).where(eq(products.categoryId, tkaninyRow.id));
    await db.delete(categories).where(eq(categories.id, tkaninyRow.id));
  }

  // 6. Ukryj demo produkty
  await db
    .update(products)
    .set({ isPublished: false })
    .where(like(products.id, "prod-%"));

  console.log("Zakończono migrację asortymentu.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Błąd podczas migracji:", e);
  process.exit(1);
});
