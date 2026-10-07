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
    console.log("âš ď¸Ź  DATABASE_URL zawiera placeholder lub nie jest ustawiony w .env.local.");
    return;
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log("đźŚ± Rozpoczynam wypeĹ‚nianie bazy danych (seed)...");

  // 1. Konto administratora â€“ tylko jeĹ›li podano dane w zmiennych Ĺ›rodowiskowych
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (adminEmail && adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await db
      .insert(schema.users)
      .values({ name: "Administrator", email: adminEmail, password: hashedPassword, role: "admin" })
      .onConflictDoNothing();
    console.log("âś… Konto administratora:", adminEmail);
  } else {
    console.log("â„ąď¸Ź  PominiÄ™to konto admina (ustaw ADMIN_EMAIL i ADMIN_INITIAL_PASSWORD albo uĹĽyj src/db/set-admin.ts).");
  }

  // 2. Kategorie gĹ‚Ăłwne
  const [szydelko] = await db
    .insert(schema.categories)
    .values({
      namePl: "SzydeĹ‚ko",
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
        namePl: "BiĹĽuteria z modeliny i gliny",
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

  // 3. Podkategorie szydeĹ‚ka
  if (szydelko) {
    await db
      .insert(schema.categories)
      .values([
        { namePl: "Pluszaki", nameEn: "Plushies", slug: "pluszaki", parentId: szydelko.id, sortOrder: 1 },
        { namePl: "Breloczki", nameEn: "Keychains", slug: "breloczki", parentId: szydelko.id, sortOrder: 2 },
        { namePl: "Gumki do wĹ‚osĂłw", nameEn: "Hair scrunchies", slug: "gumki-do-wlosow", parentId: szydelko.id, sortOrder: 3 },
        { namePl: "Torebki", nameEn: "Bags", slug: "torebki", parentId: szydelko.id, sortOrder: 4 },
      ])
      .onConflictDoNothing();
  }
  console.log("âś… Kategorie utworzone");

  // 4. Slajdy karuzeli
  await db
    .insert(schema.homepageContent)
    .values([
      {
        section: "carousel",
        imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1600&q=80",
        titlePl: "Kasia Łaciak â€“ szydeĹ‚kowe cuda",
        titleEn: "Kasia Łaciak â€“ crochet wonders",
        descriptionPl: "Pluszaki, breloczki, gumki do wĹ‚osĂłw i torebki dziergane rÄ™cznie na zamĂłwienie",
        descriptionEn: "Plushies, keychains, scrunchies and bags crocheted by hand to order",
        linkUrl: "/produkty",
        sortOrder: 1,
        isActive: true,
      },
      {
        section: "carousel",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
        titlePl: "BiĹĽuteria z modeliny i gliny",
        titleEn: "Polymer & clay jewelry",
        descriptionPl: "Unikatowe ozdoby wykonane rÄ™cznie, tylko na zamĂłwienie",
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
      titlePl: "RÄ™cznie, powoli, z pasjÄ…",
      titleEn: "Handmade, slowly, with passion",
      descriptionPl:
        "Kasia Łaciak to pracownia, w ktĂłrej kaĹĽdy pluszak, breloczek, gumka i torebka powstaje na szydeĹ‚ku, a biĹĽuteria z modeliny i gliny oraz ceramika â€“ w caĹ‚oĹ›ci rÄ™cznie. Wszystko robimy na zamĂłwienie, dlatego moĹĽesz wybraÄ‡ kolory i dodaÄ‡ wĹ‚asne ĹĽyczenia.",
      descriptionEn:
        "Kasia Łaciak is a studio where every plushie, keychain, scrunchie and bag is crocheted, while polymer clay jewelry and ceramics are fully handmade. Everything is made to order, so you can choose colors and add your own wishes.",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    })
    .onConflictDoNothing();

  console.log("đźŽ‰ Seed bazy danych zakoĹ„czony sukcesem! (produkty dodajesz w panelu admina)");
}

seed().catch(console.error);
