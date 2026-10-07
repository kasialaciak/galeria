import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env.local" });
config({ path: ".env" });

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("placeholder")) {
    console.log("⚠️  DATABASE_URL zawiera placeholder lub nie jest ustawiony w .env.local.");
    return;
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log("🌱 Rozpoczynam wypełnianie bazy danych (seed)...");

  // 1. Konto administratora – tylko jeśli podano dane w zmiennych środowiskowych
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (adminEmail && adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await db
      .insert(schema.users)
      .values({ name: "Administrator", email: adminEmail, password: hashedPassword, role: "admin" })
      .onConflictDoNothing();
    console.log("✅ Konto administratora:", adminEmail);
  } else {
    console.log("ℹ️  Pominięto konto admina (ustaw ADMIN_EMAIL i ADMIN_INITIAL_PASSWORD albo użyj src/db/set-admin.ts).");
  }

  // 2. Kategorie główne
  const [szydelko] = await db
    .insert(schema.categories)
    .values({
      namePl: "Szydełko",
      nameEn: "Crochet",
      slug: "szydelko",
      image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
    })
    .onConflictDoNothing()
    .returning();

  await db
    .insert(schema.categories)
    .values([
      {
        namePl: "Biżuteria z modeliny i gliny",
        nameEn: "Polymer & Clay Jewelry",
        slug: "bizuteria",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
        sortOrder: 2,
      },
      {
        namePl: "Ceramika",
        nameEn: "Ceramics",
        slug: "ceramika",
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing();

  // 3. Podkategorie szydełka
  if (szydelko) {
    await db
      .insert(schema.categories)
      .values([
        { namePl: "Pluszaki", nameEn: "Plushies", slug: "pluszaki", parentId: szydelko.id, sortOrder: 1 },
        { namePl: "Breloczki", nameEn: "Keychains", slug: "breloczki", parentId: szydelko.id, sortOrder: 2 },
        { namePl: "Gumki do włosów", nameEn: "Hair scrunchies", slug: "gumki-do-wlosow", parentId: szydelko.id, sortOrder: 3 },
        { namePl: "Torebki", nameEn: "Bags", slug: "torebki", parentId: szydelko.id, sortOrder: 4 },
      ])
      .onConflictDoNothing();
  }
  console.log("✅ Kategorie utworzone");

  // 4. Slajdy karuzeli
  await db
    .insert(schema.homepageContent)
    .values([
      {
        section: "carousel",
        imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1600&q=80",
        titlePl: "Cosmic Loop – szydełkowe cuda",
        titleEn: "Cosmic Loop – crochet wonders",
        descriptionPl: "Pluszaki, breloczki, gumki do włosów i torebki dziergane ręcznie na zamówienie",
        descriptionEn: "Plushies, keychains, scrunchies and bags crocheted by hand to order",
        linkUrl: "/produkty",
        sortOrder: 1,
        isActive: true,
      },
      {
        section: "carousel",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
        titlePl: "Biżuteria z modeliny i gliny",
        titleEn: "Polymer & clay jewelry",
        descriptionPl: "Unikatowe ozdoby wykonane ręcznie, tylko na zamówienie",
        descriptionEn: "One-of-a-kind handmade accessories, made to order only",
        linkUrl: "/produkty",
        sortOrder: 2,
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 5. Sekcja O nas
  await db
    .insert(schema.homepageContent)
    .values({
      section: "about",
      titlePl: "Ręcznie, powoli, z pasją",
      titleEn: "Handmade, slowly, with passion",
      descriptionPl:
        "Cosmic Loop to pracownia, w której każdy pluszak, breloczek, gumka i torebka powstaje na szydełku, a biżuteria z modeliny i gliny oraz ceramika – w całości ręcznie. Wszystko robimy na zamówienie, dlatego możesz wybrać kolory i dodać własne życzenia.",
      descriptionEn:
        "Cosmic Loop is a studio where every plushie, keychain, scrunchie and bag is crocheted, while polymer clay jewelry and ceramics are fully handmade. Everything is made to order, so you can choose colors and add your own wishes.",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    })
    .onConflictDoNothing();

  console.log("🎉 Seed bazy danych zakończony sukcesem! (produkty dodajesz w panelu admina)");
}

seed().catch(console.error);
