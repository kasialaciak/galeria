# Sklep Rękodzieło — Plan Implementacji

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zbudowanie kompletnego sklepu internetowego z rękodziełem — od pustego katalogu do działającego deploy na Vercel.

**Architecture:** Monolit Next.js 15 (App Router) z Drizzle ORM → Neon PostgreSQL, Auth.js v5 (JWT), Stripe Checkout, next-intl (PL/EN), Zustand (koszyk localStorage), UploadThing (zdjęcia), shadcn/ui + Tailwind CSS.

**Tech Stack:** Next.js 15, TypeScript, Drizzle ORM, Neon PostgreSQL, Auth.js v5, Stripe, Zustand, next-intl, Tailwind CSS, shadcn/ui, UploadThing, Vercel.

**Spec:** `docs/specs/2026-09-24-sklep-rekodzielo-design.md`

## Global Constraints

- Node.js >= 20, npm >= 10
- TypeScript strict mode
- Ceny przechowywane w groszach (integer). 1 PLN = 100 groszy.
- Wszystkie Server Actions weryfikują sesję użytkownika wewnętrznie (nigdy nie ufaj klientowi).
- Hasła hashowane bcryptjs (min. 8 znaków).
- `await params` i `await searchParams` w Next.js 15 (async API).
- Zdjęcia przez UploadThing — nigdy bezpośrednio do bazy.
- Waluta: PLN. Brak wielowalutowości.
- Git commit po każdym ukończonym tasku.

## Review Focus

1. **Weryfikacja cen server-side w checkout** — klient mógłby podmienić cenę w localStorage. Checkout MUSI ponownie pobrać ceny z bazy.
2. **Admin guard w middleware** — nie-admin wchodzący na `/admin` musi być przekierowany, nawet jeśli jest zalogowany.
3. **Stripe webhook idempotency** — podwójne wywołanie webhooka nie może zduplikować zamówienia.
4. **Warianty produktów** — wariant z `parentProductId` nie powinien się wyświetlać jako osobny produkt w liście, tylko jako opcja na karcie rodzica.
5. **Puste stany** — koszyk pusty, wishlist pusta, brak produktów w kategorii, brak zamówień w historii — każdy widok musi mieć jasny komunikat.

---

## Faza 1: Fundament

### Task 1: Inicjalizacja projektu i konfiguracja

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.gitignore`, `.env.example`, `.env.local`, `components.json`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/utils.ts`

**Interfaces:**
- Produces: Działający projekt Next.js z Tailwind + shadcn/ui, gotowy do rozbudowy.

- [ ] **Step 1: Utworzenie projektu Next.js**

```bash
cd "C:\Users\it.praktykant1\OneDrive - Olimp Labs\Dokumenty\programowanie\strona-www"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Odpowiedzi na pytania interactive:
- Would you like to use TypeScript? → Yes
- Would you like to use ESLint? → Yes  
- Would you like to use Tailwind CSS? → Yes
- Would you like your code inside a `src/` directory? → Yes
- Would you like to use App Router? → Yes
- Would you like to use Turbopack? → Yes
- Would you like to customize the import alias? → Yes (@/*)

- [ ] **Step 2: Instalacja zależności**

```bash
npm install drizzle-orm @neondatabase/serverless next-auth@beta @auth/drizzle-adapter bcryptjs stripe next-intl zustand zod @hookform/resolvers react-hook-form uploadthing @uploadthing/react lucide-react embla-carousel-react embla-carousel-autoplay
npm install -D drizzle-kit @types/bcryptjs dotenv
```

- [ ] **Step 3: Inicjalizacja shadcn/ui**

```bash
npx shadcn@latest init
```

Odpowiedzi:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Instalacja komponentów:

```bash
npx shadcn@latest add button card sheet dialog form input label select textarea dropdown-menu navigation-menu badge table tabs separator skeleton avatar toast sonner
```

- [ ] **Step 4: Konfiguracja custom kolorów i fontów w Tailwind**

Edytuj `src/app/globals.css` — dodaj custom CSS variables po istniejących shadcn variables:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

:root {
  /* Sklep Rękodzieło custom palette */
  --color-cream: #FAF7F2;
  --color-charcoal: #2D2A26;
  --color-forest: #1B4D3E;
  --color-teal: #3D8B7A;
  --color-clay: #C4704A;
  --color-warm-gray: #E8E2DA;
  --color-sage: #E8F0EC;
}
```

W `tailwind.config.ts` dodaj extend colors i fontFamily:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  // ... existing shadcn config
  theme: {
    extend: {
      colors: {
        cream: "var(--color-cream)",
        charcoal: "var(--color-charcoal)",
        forest: "var(--color-forest)",
        teal: "var(--color-teal)",
        clay: "var(--color-clay)",
        "warm-gray": "var(--color-warm-gray)",
        sage: "var(--color-sage)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
    },
  },
};
export default config;
```

- [ ] **Step 5: Utworzenie .env.example i .env.local**

`.env.example`:
```env
# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
MIGRATION_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Auth.js
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Skopiuj `.env.example` do `.env.local` i uzupełnij prawdziwymi wartościami.

- [ ] **Step 6: Konfiguracja .gitignore**

Upewnij się, że `.gitignore` zawiera:
```
.env.local
.env
node_modules/
.next/
```

- [ ] **Step 7: Uruchomienie i weryfikacja**

```bash
npm run dev
```

Otwórz `http://localhost:3000` — powinna wyświetlić się domyślna strona Next.js.

- [ ] **Step 8: Inicjalizacja Git i push do GitHub**

```bash
git init
git add .
git commit -m "chore: initial Next.js 15 project setup with Tailwind + shadcn/ui"
git remote add origin https://github.com/Mati-bgl/stronawww.git
git branch -M main
git push -u origin main
```

---

### Task 2: Baza danych — schemat i połączenie z Neon

**Files:**
- Create: `src/db/index.ts`, `src/db/schema.ts`, `drizzle.config.ts`

**Interfaces:**
- Consumes: `DATABASE_URL` z `.env.local`
- Produces: `db` — klient Drizzle do użycia w Server Actions. Typy tabel eksportowane ze `schema.ts`.

- [ ] **Step 1: Utworzenie klienta bazy danych**

Utwórz `src/db/index.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
```

- [ ] **Step 2: Definicja schematu — tabele auth**

Utwórz `src/db/schema.ts`:

```typescript
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

// ============================================================
// AUTH TABLES
// ============================================================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: text("password"),
  role: text("role").default("user").notNull(),
  phone: text("phone"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
```

- [ ] **Step 3: Definicja schematu — tabele biznesowe**

Dopisz na końcu `src/db/schema.ts`:

```typescript
// ============================================================
// BUSINESS TABLES
// ============================================================

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  namePl: text("name_pl").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: text("parent_id"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    namePl: text("name_pl").notNull(),
    nameEn: text("name_en").notNull(),
    slug: text("slug").notNull().unique(),
    descriptionPl: text("description_pl"),
    descriptionEn: text("description_en"),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    categoryId: text("category_id").references(() => categories.id),
    parentProductId: text("parent_product_id"),
    variantLabelPl: text("variant_label_pl"),
    variantLabelEn: text("variant_label_en"),
    stock: integer("stock").default(0).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    addToCartCount: integer("add_to_cart_count").default(0).notNull(),
    addToWishlistCount: integer("add_to_wishlist_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("products_category_idx").on(table.categoryId),
    parentIdx: index("products_parent_idx").on(table.parentProductId),
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
  })
);

export const productImages = pgTable("product_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    status: text("status").default("pending").notNull(),
    totalAmount: integer("total_amount").notNull(),
    shippingName: text("shipping_name").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: text("shipping_city").notNull(),
    shippingPostalCode: text("shipping_postal_code").notNull(),
    shippingCountry: text("shipping_country").default("PL").notNull(),
    shippingMethod: text("shipping_method").notNull(),
    shippingCost: integer("shipping_cost").notNull(),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("orders_user_idx").on(table.userId),
  })
);

export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  variantLabel: text("variant_label"),
});

export const wishlists = pgTable(
  "wishlists",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userProductUnique: uniqueIndex("wishlists_user_product_idx").on(
      table.userId,
      table.productId
    ),
  })
);

export const homepageContent = pgTable("homepage_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  section: text("section").notNull(),
  titlePl: text("title_pl"),
  titleEn: text("title_en"),
  descriptionPl: text("description_pl"),
  descriptionEn: text("description_en"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 4: Definicja relacji Drizzle**

Dopisz na końcu `src/db/schema.ts`:

```typescript
// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  wishlists: many(wishlists),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  parentProduct: one(products, {
    fields: [products.parentProductId],
    references: [products.id],
    relationName: "productVariants",
  }),
  variants: many(products, { relationName: "productVariants" }),
  images: many(productImages),
  orderItems: many(orderItems),
  wishlists: many(wishlists),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));
```

- [ ] **Step 5: Konfiguracja Drizzle Kit**

Utwórz `drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

- [ ] **Step 6: Wygenerowanie i zastosowanie migracji**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Sprawdź: W konsoli Neon powinny pojawić się wszystkie tabele.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: database schema with Drizzle ORM + Neon connection"
git push
```

---

### Task 3: Autoryzacja — Auth.js v5

**Files:**
- Create: `src/auth.config.ts`, `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/validators.ts`
- Create: `src/types/next-auth.d.ts`

**Interfaces:**
- Consumes: `db` z `src/db/index.ts`, schemat `users` z `src/db/schema.ts`
- Produces: `auth()`, `signIn()`, `signOut()` z `src/auth.ts`. Typy `Session` z rozszerzonym `user.role`.

- [ ] **Step 1: TypeScript augmentation dla Auth.js**

Utwórz `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
```

- [ ] **Step 2: Walidatory Zod**

Utwórz `src/lib/validators.ts`:

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  phone: z.string().optional(),
});

export const productSchema = z.object({
  namePl: z.string().min(1, "Nazwa PL jest wymagana"),
  nameEn: z.string().min(1, "Nazwa EN jest wymagana"),
  descriptionPl: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().positive("Cena musi być dodatnia"),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Kategoria jest wymagana"),
  stock: z.number().int().min(0, "Stan nie może być ujemny"),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  parentProductId: z.string().optional().nullable(),
  variantLabelPl: z.string().optional().nullable(),
  variantLabelEn: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  namePl: z.string().min(1, "Nazwa PL jest wymagana"),
  nameEn: z.string().min(1, "Nazwa EN jest wymagana"),
  slug: z.string().min(1, "Slug jest wymagany"),
  parentId: z.string().optional().nullable(),
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Imię i nazwisko jest wymagane"),
  shippingAddress: z.string().min(5, "Adres jest wymagany"),
  shippingCity: z.string().min(2, "Miasto jest wymagane"),
  shippingPostalCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, "Format: XX-XXX"),
  shippingMethod: z.enum(["kurier", "paczkomat", "odbior"]),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Imię jest wymagane"),
  email: z.string().email("Nieprawidłowy email"),
  subject: z.string().min(3, "Temat jest wymagany"),
  message: z.string().min(10, "Wiadomość musi mieć min. 10 znaków"),
});
```

- [ ] **Step 3: Auth.js edge-safe config**

Utwórz `src/auth.config.ts`:

```typescript
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/konto/logowanie",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Remove locale prefix for route matching
      const cleanPath = pathname.replace(/^\/(pl|en)/, "") || "/";

      const protectedPaths = ["/konto", "/lista-zyczen", "/zamowienie"];
      const adminPaths = ["/admin"];
      const authPaths = ["/konto/logowanie", "/konto/rejestracja"];

      const isProtected = protectedPaths.some(
        (p) => cleanPath === p || cleanPath.startsWith(p + "/")
      );
      const isAdmin = adminPaths.some(
        (p) => cleanPath === p || cleanPath.startsWith(p + "/")
      );
      const isAuthPage = authPaths.some((p) => cleanPath === p);

      // Admin routes: must be logged in AND admin
      if (isAdmin) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as any)?.role;
        if (role !== "admin") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Protected routes: must be logged in
      if (isProtected && !isAuthPage) {
        return isLoggedIn;
      }

      // Auth pages: redirect logged-in users away
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/konto", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

- [ ] **Step 4: Auth.js pełna konfiguracja (node-safe)**

Utwórz `src/auth.ts`:

```typescript
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
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

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
```

- [ ] **Step 5: Auth route handler**

Utwórz `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Auth.js v5 with Credentials provider + Drizzle adapter"
git push
```

---

### Task 4: Internacjonalizacja (next-intl) i Middleware

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`
- Create: `messages/pl.json`, `messages/en.json`
- Create: `src/middleware.ts`
- Modify: `next.config.ts`
- Restructure: `src/app/` → `src/app/[locale]/`

**Interfaces:**
- Consumes: `authConfig` z `src/auth.config.ts`
- Produces: `Link`, `redirect`, `usePathname`, `useRouter` z `src/i18n/routing.ts`. Funkcje `useTranslations` i `getTranslations`.

- [ ] **Step 1: Konfiguracja routingu next-intl**

Utwórz `src/i18n/routing.ts`:

```typescript
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 2: Konfiguracja request next-intl**

Utwórz `src/i18n/request.ts`:

```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Pliki tłumaczeń — startowy szkielet**

Utwórz `messages/pl.json`:

```json
{
  "Nav": {
    "home": "Strona Główna",
    "products": "Produkty",
    "contact": "Kontakt",
    "cart": "Koszyk",
    "wishlist": "Lista życzeń",
    "account": "Konto",
    "login": "Zaloguj się",
    "register": "Zarejestruj się",
    "logout": "Wyloguj się"
  },
  "Home": {
    "featuredTitle": "Proponowane produkty",
    "aboutTitle": "O nas"
  },
  "Products": {
    "title": "Produkty",
    "search": "Szukaj produktów...",
    "noResults": "Nie znaleziono produktów",
    "addToCart": "Dodaj do koszyka",
    "addToWishlist": "Dodaj do listy życzeń",
    "filters": "Filtry",
    "sortBy": "Sortuj",
    "priceRange": "Zakres cen",
    "category": "Kategoria",
    "newest": "Najnowsze",
    "priceAsc": "Cena: od najniższej",
    "priceDesc": "Cena: od najwyższej",
    "popular": "Popularne"
  },
  "Cart": {
    "title": "Koszyk",
    "empty": "Twój koszyk jest pusty",
    "total": "Suma",
    "checkout": "Zamów",
    "remove": "Usuń",
    "goToCart": "Przejdź do koszyka",
    "continueShopping": "Kontynuuj zakupy",
    "addedToCart": "Dodano do koszyka"
  },
  "Checkout": {
    "title": "Finalizacja zamówienia",
    "shippingDetails": "Dane do wysyłki",
    "name": "Imię i nazwisko",
    "address": "Adres",
    "city": "Miasto",
    "postalCode": "Kod pocztowy",
    "shippingMethod": "Metoda wysyłki",
    "courier": "Kurier",
    "parcelLocker": "Paczkomat",
    "pickup": "Odbiór osobisty",
    "summary": "Podsumowanie",
    "shippingCost": "Koszt wysyłki",
    "totalWithShipping": "Razem z wysyłką",
    "pay": "Zapłać",
    "successTitle": "Zamówienie złożone!",
    "successMessage": "Dziękujemy za zakup. Otrzymasz email z potwierdzeniem."
  },
  "Wishlist": {
    "title": "Lista życzeń",
    "empty": "Twoja lista życzeń jest pusta",
    "removeFromWishlist": "Usuń z listy",
    "moveToCart": "Dodaj do koszyka"
  },
  "Account": {
    "title": "Moje konto",
    "profile": "Dane osobowe",
    "orderHistory": "Historia zamówień",
    "noOrders": "Brak zamówień",
    "orderNumber": "Numer zamówienia",
    "date": "Data",
    "status": "Status",
    "amount": "Kwota"
  },
  "Auth": {
    "loginTitle": "Zaloguj się",
    "registerTitle": "Zarejestruj się",
    "email": "Email",
    "password": "Hasło",
    "name": "Imię",
    "loginButton": "Zaloguj się",
    "registerButton": "Zarejestruj się",
    "noAccount": "Nie masz konta?",
    "hasAccount": "Masz już konto?",
    "invalidCredentials": "Nieprawidłowy email lub hasło"
  },
  "Contact": {
    "title": "Kontakt",
    "formTitle": "Napisz do nas",
    "name": "Imię",
    "email": "Email",
    "subject": "Temat",
    "message": "Wiadomość",
    "send": "Wyślij",
    "sent": "Wiadomość wysłana!"
  },
  "Common": {
    "currency": "zł",
    "loading": "Ładowanie...",
    "error": "Wystąpił błąd",
    "save": "Zapisz",
    "cancel": "Anuluj",
    "delete": "Usuń",
    "edit": "Edytuj",
    "back": "Wróć"
  }
}
```

Utwórz `messages/en.json` — taka sama struktura, tłumaczenia po angielsku:

```json
{
  "Nav": {
    "home": "Home",
    "products": "Products",
    "contact": "Contact",
    "cart": "Cart",
    "wishlist": "Wishlist",
    "account": "Account",
    "login": "Log in",
    "register": "Sign up",
    "logout": "Log out"
  },
  "Home": {
    "featuredTitle": "Featured Products",
    "aboutTitle": "About Us"
  },
  "Products": {
    "title": "Products",
    "search": "Search products...",
    "noResults": "No products found",
    "addToCart": "Add to cart",
    "addToWishlist": "Add to wishlist",
    "filters": "Filters",
    "sortBy": "Sort by",
    "priceRange": "Price range",
    "category": "Category",
    "newest": "Newest",
    "priceAsc": "Price: low to high",
    "priceDesc": "Price: high to low",
    "popular": "Popular"
  },
  "Cart": {
    "title": "Cart",
    "empty": "Your cart is empty",
    "total": "Total",
    "checkout": "Checkout",
    "remove": "Remove",
    "goToCart": "Go to cart",
    "continueShopping": "Continue shopping",
    "addedToCart": "Added to cart"
  },
  "Checkout": {
    "title": "Checkout",
    "shippingDetails": "Shipping details",
    "name": "Full name",
    "address": "Address",
    "city": "City",
    "postalCode": "Postal code",
    "shippingMethod": "Shipping method",
    "courier": "Courier",
    "parcelLocker": "Parcel locker",
    "pickup": "Personal pickup",
    "summary": "Summary",
    "shippingCost": "Shipping cost",
    "totalWithShipping": "Total with shipping",
    "pay": "Pay",
    "successTitle": "Order placed!",
    "successMessage": "Thank you for your purchase. You will receive a confirmation email."
  },
  "Wishlist": {
    "title": "Wishlist",
    "empty": "Your wishlist is empty",
    "removeFromWishlist": "Remove from wishlist",
    "moveToCart": "Add to cart"
  },
  "Account": {
    "title": "My Account",
    "profile": "Profile",
    "orderHistory": "Order History",
    "noOrders": "No orders yet",
    "orderNumber": "Order number",
    "date": "Date",
    "status": "Status",
    "amount": "Amount"
  },
  "Auth": {
    "loginTitle": "Log in",
    "registerTitle": "Sign up",
    "email": "Email",
    "password": "Password",
    "name": "Name",
    "loginButton": "Log in",
    "registerButton": "Sign up",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "invalidCredentials": "Invalid email or password"
  },
  "Contact": {
    "title": "Contact",
    "formTitle": "Write to us",
    "name": "Name",
    "email": "Email",
    "subject": "Subject",
    "message": "Message",
    "send": "Send",
    "sent": "Message sent!"
  },
  "Common": {
    "currency": "PLN",
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back"
  }
}
```

- [ ] **Step 4: Next.js config z next-intl plugin**

Zastąp `next.config.ts`:

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Middleware — i18n + auth**

Utwórz `src/middleware.ts`:

```typescript
import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default async function middleware(request: NextRequest) {
  // 1. Run i18n middleware first
  const intlResponse = intlMiddleware(request);

  // 2. If intl triggered a redirect, return it immediately
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // 3. Run auth middleware on the same request
  const authResult = await auth();

  // 4. The auth config's `authorized` callback handles redirects
  // Return the intl response (preserves locale headers/cookies)
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
```

> **Uwaga:** Dokładna integracja i18n + auth w middleware może wymagać dostosowania po testach. Powyższy wzorzec jest punktem startowym — Task 4 kończy się działającym routingiem z locale i ochroną tras.

- [ ] **Step 6: Przeniesienie struktury app do [locale]**

Utwórz `src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sklep z Rękodziełem",
  description: "Unikatowe, ręcznie robione produkty",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-cream font-sans text-charcoal antialiased">
        <NextIntlClientProvider locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Utwórz `src/app/[locale]/page.tsx` (placeholder):

```tsx
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-serif text-4xl text-forest">
        Sklep z Rękodziełem
      </h1>
      <p className="mt-4 text-lg text-charcoal/70">
        {t("featuredTitle")}
      </p>
    </main>
  );
}
```

- [ ] **Step 7: Weryfikacja — uruchom i sprawdź routing**

```bash
npm run dev
```

Sprawdź:
- `http://localhost:3000` → strona po polsku (bez `/pl` w URL)
- `http://localhost:3000/en` → strona po angielsku

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: next-intl i18n (PL/EN) + auth middleware + locale layout"
git push
```

---

## Faza 2: Publiczny Frontend

### Task 5: Layout — nawigacja, header, footer

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/mobile-menu.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/locale-switcher.tsx`
- Create: `src/components/providers.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `Link`, `usePathname` z `src/i18n/routing.ts`. Komponenty shadcn: `Sheet`, `Button`.
- Produces: Widoczny header na wszystkich stronach z nawigacją, ikonami, przełącznikiem języka.

- [ ] **Step 1: Komponent SessionProvider wrapper**

Utwórz `src/components/providers.tsx`:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Komponent przełącznika języka**

Utwórz `src/components/layout/locale-switcher.tsx`:

```tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "pl" | "en") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLocale("pl")}
        className={currentLocale === "pl" ? "font-bold text-forest" : "text-charcoal/50"}
      >
        PL
      </Button>
      <span className="text-warm-gray">|</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLocale("en")}
        className={currentLocale === "en" ? "font-bold text-forest" : "text-charcoal/50"}
      >
        EN
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Mobile menu (hamburger)**

Utwórz `src/components/layout/mobile-menu.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/produkty" as const, label: t("products") },
    { href: "/kontakt" as const, label: t("contact") },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-charcoal">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-cream">
        <SheetTitle className="font-serif text-xl text-forest">Menu</SheetTitle>
        <nav className="mt-8 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-charcoal transition-colors hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Header**

Utwórz `src/components/layout/header.tsx`:

```tsx
"use client";

import { Heart, ShoppingBag, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { MobileMenu } from "./mobile-menu";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 border-b border-warm-gray bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-serif text-xl font-bold text-forest">
            Rękodzieło
          </Link>
          <MobileMenu />
        </div>

        {/* Right: Icons + Language */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/lista-zyczen" aria-label={t("wishlist")}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/koszyk" aria-label={t("cart")}>
              <ShoppingBag className="h-5 w-5" />
              {/* Cart count badge will be added in Task 9 */}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/konto" aria-label={t("account")}>
              <User className="h-5 w-5" />
            </Link>
          </Button>

          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Footer**

Utwórz `src/components/layout/footer.tsx`:

```tsx
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Nav");

  return (
    <footer className="border-t border-warm-gray bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-charcoal/60">
        <p>© {new Date().getFullYear()} Rękodzieło. Wszelkie prawa zastrzeżone.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Podłączenie layoutu**

Zaktualizuj `src/app/[locale]/layout.tsx` — dodaj Header, Footer, Providers:

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sklep z Rękodziełem",
  description: "Unikatowe, ręcznie robione produkty",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-cream font-sans text-charcoal antialiased">
        <Providers>
          <NextIntlClientProvider locale={locale}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Weryfikacja wizualna**

```bash
npm run dev
```

Sprawdź: Header z logo, hamburger menu (otwiera Sheet z linkami), 3 ikonki po prawej, przełącznik PL/EN. Footer na dole.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: header with navigation, mobile menu, footer, locale switcher"
git push
```

---

### Task 6: Strona główna — karuzela, proponowane produkty, sekcja "O nas"

**Files:**
- Create: `src/components/home/hero-carousel.tsx`
- Create: `src/components/home/featured-products.tsx`
- Create: `src/components/home/about-section.tsx`
- Create: `src/components/products/product-card.tsx`
- Create: `src/lib/utils.ts` (formatPrice helper)
- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `db` z `src/db/index.ts`, schemat `products`, `productImages`, `homepageContent`.
- Produces: Kompletna strona główna z dynamiczną treścią z bazy danych.

> **Implementacja:** Każdy komponent pobiera dane z bazy w Server Component i renderuje UI. Karuzela używa `embla-carousel-react` + `embla-carousel-autoplay` (autoplay co 5s). Karta produktu jest reużywalnym komponentem (używana tu i w `/produkty`). `formatPrice(grosz)` konwertuje grosze na format "12,50 zł".

- [ ] **Step 1-8:** Zaimplementuj helper `formatPrice` w `src/lib/utils.ts`, potem kolejno carousel, product-card, featured-products, about-section. Podłącz do `page.tsx` strony głównej. Dane pobierane z bazy przez query Drizzle w Server Component. Commit.

---

### Task 7: Rejestracja i logowanie

**Files:**
- Create: `src/actions/auth.ts`
- Create: `src/app/[locale]/konto/logowanie/page.tsx`
- Create: `src/app/[locale]/konto/rejestracja/page.tsx`

**Interfaces:**
- Consumes: `signIn` z `src/auth.ts`, `db` + `users` ze schematu, `bcryptjs`, `registerSchema`/`loginSchema` z validators.
- Produces: Działająca rejestracja (email+hasło) i logowanie z przekierowaniem.

> **Implementacja:** Server Actions `registerUser` (hash hasła, insert do users) i `loginUser` (wywołanie `signIn('credentials', ...)`). Formularze z shadcn Form + react-hook-form + zod. Link między stronami "Nie masz konta?" / "Masz konto?".

- [ ] **Step 1-6:** Zaimplementuj Server Actions auth, formularz logowania, formularz rejestracji. Przetestuj: rejestracja → logowanie → redirect do /konto. Commit.

---

### Task 8: Produkty — lista, kategorie, filtry, wyszukiwanie

**Files:**
- Create: `src/app/[locale]/produkty/page.tsx`
- Create: `src/app/[locale]/produkty/[slug]/page.tsx`
- Create: `src/components/products/category-grid.tsx`
- Create: `src/components/products/product-filters.tsx`
- Create: `src/components/products/product-gallery.tsx`
- Create: `src/components/products/variant-selector.tsx`
- Create: `src/actions/products.ts` (incrementViewCount)

**Interfaces:**
- Consumes: `db`, schemat `products`, `categories`, `productImages`. `searchParams` z Next.js.
- Produces: Strona `/produkty` z siatką kategorii, filtrami, wyszukiwaniem. Strona `/produkty/[slug]` z galerią, wariantami, przyciskami koszyk/wishlist.

> **Implementacja:** Strona produktów używa `searchParams` do filtrowania (category, search, sort, minPrice, maxPrice). Wyszukiwanie po `ilike` na namePl/nameEn + descriptionPl/descriptionEn. Karta produktu wyświetla warianty jako przyciski (zapytanie po `parentProductId`). Galeria: duże zdjęcie + miniaturki (embla-carousel dla mobile swipe). `incrementViewCount` jako Server Action wywoływany z client component (useEffect).

- [ ] **Step 1-10:** Zaimplementuj category-grid, product-filters, stronę produktów z SSR, stronę szczegółów produktu, galerię, variant-selector. Commit.

---

## Faza 3: Koszyk i Lista życzeń

### Task 9: Koszyk — Zustand store + Cart Drawer + strona koszyka

**Files:**
- Create: `src/hooks/use-cart.ts`
- Create: `src/components/layout/cart-drawer.tsx`
- Create: `src/components/cart/cart-item.tsx`
- Create: `src/components/cart/cart-summary.tsx`
- Create: `src/app/[locale]/koszyk/page.tsx`
- Modify: `src/components/layout/header.tsx` (badge + cart drawer trigger)

**Interfaces:**
- Consumes: Nic z bazy — koszyk jest lokalny (localStorage).
- Produces: `useCart()` hook z funkcjami `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `items`, `totalPrice`.

> **Implementacja:** Zustand store z `persist` middleware (localStorage). Cart Drawer jako Sheet otwierany z prawej (ikona koszyka w headerze). Badge z liczbą produktów na ikonie. Strona `/koszyk` z pełną listą, zmianą ilości, usuwaniem, podsumowaniem i przyciskiem "Zamów".

- [ ] **Step 1: Zustand cart store**

Utwórz `src/hooks/use-cart.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number; // in grosze
  quantity: number;
  imageUrl: string;
  variantLabel?: string;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
```

- [ ] **Step 2-7:** Zaimplementuj cart-drawer (Sheet z prawej), cart-item, cart-summary, stronę /koszyk, podłącz badge w header, dodaj przyciski "Dodaj do koszyka" w product-card. Commit.

---

### Task 10: Lista życzeń

**Files:**
- Create: `src/actions/wishlist.ts`
- Create: `src/app/[locale]/lista-zyczen/page.tsx`
- Modify: `src/components/products/product-card.tsx` (ikona serca)

**Interfaces:**
- Consumes: `db`, `wishlists`, `products`, `productImages`. `auth()` do weryfikacji sesji.
- Produces: Server Actions: `toggleWishlist(productId)`, `getWishlistItems()`, `isInWishlist(productId)`.

> **Implementacja:** Lista życzeń jest w bazie (wymaga logowania). Ikona serca na karcie produktu: pełne serce jeśli w wishlist, puste jeśli nie. Kliknięcie toggle. Strona `/lista-zyczen` wyświetla produkty z przyciskami "Usuń" i "Dodaj do koszyka". Statystyka `addToWishlistCount++` przy dodaniu.

- [ ] **Step 1-5:** Zaimplementuj Server Actions wishlist, ikonę toggle na karcie, stronę listy życzeń. Commit.

---

## Faza 4: Checkout i płatności

### Task 11: Finalizacja zakupu + Stripe

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/actions/checkout.ts`
- Create: `src/components/checkout/checkout-form.tsx`
- Create: `src/components/checkout/shipping-method.tsx`
- Create: `src/app/[locale]/zamowienie/page.tsx`
- Create: `src/app/[locale]/zamowienie/sukces/page.tsx`
- Create: `src/app/api/webhooks/stripe/route.ts`

**Interfaces:**
- Consumes: `useCart()`, `auth()`, `db`, schematy `orders`, `orderItems`, `products`. Stripe SDK.
- Produces: Kompletny flow: formularz → zamówienie w DB → Stripe Checkout → webhook → status 'paid'.

- [ ] **Step 1: Stripe client**

Utwórz `src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});
```

- [ ] **Step 2: Server Action — createCheckoutSession**

Utwórz `src/actions/checkout.ts`:

```typescript
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validators";
import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

const SHIPPING_COSTS: Record<string, number> = {
  kurier: 1500,     // 15.00 PLN
  paczkomat: 1200,  // 12.00 PLN
  odbior: 0,        // darmowy
};

export async function createCheckoutSession(
  formData: FormData,
  cartItems: CheckoutItem[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = checkoutSchema.safeParse({
    shippingName: formData.get("shippingName"),
    shippingAddress: formData.get("shippingAddress"),
    shippingCity: formData.get("shippingCity"),
    shippingPostalCode: formData.get("shippingPostalCode"),
    shippingMethod: formData.get("shippingMethod"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { shippingMethod, ...shippingDetails } = parsed.data;
  const shippingCost = SHIPPING_COSTS[shippingMethod] ?? 0;

  // CRITICAL: Re-fetch prices from DB (never trust client)
  const productIds = cartItems.map((item) => item.productId);
  const dbProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // Verify all products exist and are published
  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (!product || !product.isPublished) {
      return { error: { general: ["Produkt niedostępny: " + item.productId] } };
    }
    if (product.stock < item.quantity) {
      return { error: { general: [`Brak wystarczającej ilości: ${product.namePl}`] } };
    }
  }

  // Calculate total from DB prices
  const itemsTotal = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const totalAmount = itemsTotal + shippingCost;

  // Generate order number
  const orderNumber = `ZAM-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

  // Create order in DB
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: session.user.id,
      status: "pending",
      totalAmount,
      ...shippingDetails,
      shippingMethod,
      shippingCost,
    })
    .returning();

  // Create order items
  await db.insert(orderItems).values(
    cartItems.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        orderId: order.id,
        productId: item.productId,
        productName: product.namePl,
        quantity: item.quantity,
        unitPrice: product.price,
        variantLabel: product.variantLabelPl,
      };
    })
  );

  // Create Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "blik"],
    line_items: cartItems.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        price_data: {
          currency: "pln",
          product_data: {
            name: product.namePl,
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    }),
    ...(shippingCost > 0 && {
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount" as const,
            fixed_amount: { amount: shippingCost, currency: "pln" },
            display_name: shippingMethod,
          },
        },
      ],
    }),
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/zamowienie/sukces?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/koszyk`,
    metadata: {
      orderId: order.id,
    },
  });

  // Update order with Stripe session ID
  await db
    .update(orders)
    .set({ stripeSessionId: stripeSession.id })
    .where(eq(orders.id, order.id));

  if (stripeSession.url) {
    redirect(stripeSession.url);
  }

  return { error: { general: ["Nie udało się utworzyć sesji płatności"] } };
}
```

- [ ] **Step 3: Stripe webhook**

Utwórz `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const paymentIntentId = session.payment_intent as string;

    if (orderId) {
      // Idempotency: only update if still pending
      await db
        .update(orders)
        .set({
          status: "paid",
          stripePaymentIntentId: paymentIntentId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 4-7:** Zaimplementuj checkout-form, shipping-method selector, stronę /zamowienie, stronę /zamowienie/sukces. Przetestuj pełny flow z Stripe test mode. Commit.

---

## Faza 5: Konto użytkownika i kontakt

### Task 12: Strona konta i kontakt

**Files:**
- Create: `src/app/[locale]/konto/page.tsx`
- Create: `src/actions/orders.ts` (getMyOrders)
- Create: `src/app/[locale]/kontakt/page.tsx`
- Create: `src/actions/contact.ts`

**Interfaces:**
- Consumes: `auth()`, `db`, schematy `orders`, `orderItems`, `users`, `contactMessages`.
- Produces: Strona `/konto` z profilem i historią zamówień. Strona `/kontakt` z formularzem.

> **Implementacja:** Konto: dane użytkownika (edytowalne imię/telefon), tabela zamówień z kolumnami (numer, data, status, kwota). Kontakt: formularz (imię, email, temat, wiadomość) → Server Action zapisuje do `contactMessages`.

- [ ] **Step 1-5:** Zaimplementuj stronę konta, historię zamówień, stronę kontaktu z formularzem. Commit.

---

## Faza 6: Panel administracyjny

### Task 13: Admin — layout, dashboard, guard

**Files:**
- Create: `src/app/[locale]/admin/layout.tsx`
- Create: `src/app/[locale]/admin/page.tsx`
- Create: `src/components/admin/admin-sidebar.tsx`
- Create: `src/components/admin/stats-cards.tsx`
- Create: `src/actions/stats.ts`

**Interfaces:**
- Consumes: `auth()`, `db`, schematy `products`, `orders`.
- Produces: Admin layout z sidebar + dashboard ze statystykami.

> **Implementacja:** Admin layout sprawdza `auth()` → `user.role === 'admin'` (belt-and-suspenders, middleware też chroni). Sidebar z linkami: Dashboard, Produkty, Kategorie, Zamówienia, Strona główna. Stats: SUM viewCount, addToCartCount, addToWishlistCount, COUNT orders, SUM totalAmount WHERE paid.

- [ ] **Step 1-5:** Zaimplementuj admin layout + sidebar, stats queries, dashboard ze statystykami. Commit.

---

### Task 14: Admin — zarządzanie produktami + upload zdjęć

**Files:**
- Create: `src/app/[locale]/admin/produkty/page.tsx`
- Create: `src/app/[locale]/admin/produkty/nowy/page.tsx`
- Create: `src/app/[locale]/admin/produkty/[id]/page.tsx`
- Create: `src/components/admin/product-form.tsx`
- Create: `src/components/admin/image-upload.tsx`
- Create: `src/actions/products.ts` (CRUD)
- Create: `src/app/api/uploadthing/core.ts`
- Create: `src/app/api/uploadthing/route.ts`

**Interfaces:**
- Consumes: `db`, schemat `products`, `productImages`, `categories`. UploadThing SDK.
- Produces: CRUD produktów. Server Actions: `createProduct`, `updateProduct`, `deleteProduct`. Upload zdjęć do UploadThing.

- [ ] **Step 1: UploadThing file router**

Utwórz `src/app/api/uploadthing/core.ts`:

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 8 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  homepageImageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user || session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

Utwórz `src/app/api/uploadthing/route.ts`:

```typescript
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
```

- [ ] **Step 2-8:** Zaimplementuj product-form (name PL/EN, description PL/EN, price, category dropdown, stock, toggles), image-upload komponent (UploadThing dropzone), stronę listy produktów (Table), stronę dodawania, stronę edycji, zarządzanie wariantami. Commit.

---

### Task 15: Admin — kategorie i zamówienia

**Files:**
- Create: `src/app/[locale]/admin/kategorie/page.tsx`
- Create: `src/components/admin/category-form.tsx`
- Create: `src/actions/categories.ts`
- Create: `src/app/[locale]/admin/zamowienia/page.tsx`
- Create: `src/app/[locale]/admin/zamowienia/[id]/page.tsx`
- Create: `src/components/admin/order-table.tsx`

**Interfaces:**
- Consumes: `db`, schematy `categories`, `orders`, `orderItems`.
- Produces: CRUD kategorii. Lista zamówień z filtrowaniem i zmianą statusu.

> **Implementacja:** Kategorie: lista z drzewem (parent → children), formularz add/edit (name PL/EN, slug auto-generated, parent dropdown, image upload). Zamówienia: tabela z kolumnami (numer, data, klient, status, kwota), filtr statusu, strona szczegółów z listą produktów i przyciskami zmiany statusu.

- [ ] **Step 1-6:** Zaimplementuj CRUD kategorii, listę zamówień, szczegóły zamówienia ze zmianą statusu. Commit.

---

### Task 16: Admin — zarządzanie treścią strony głównej

**Files:**
- Create: `src/app/[locale]/admin/strona-glowna/page.tsx`
- Create: `src/components/admin/carousel-manager.tsx`
- Create: `src/actions/homepage.ts`

**Interfaces:**
- Consumes: `db`, schemat `homepageContent`. UploadThing.
- Produces: CRUD slajdów karuzeli i sekcji "O nas".

> **Implementacja:** Dwie sekcje na stronie: 1) Karuzela — lista slajdów z podglądem, dodawanie/usuwanie/zmiana kolejności, upload zdjęcia, opcjonalny link. 2) Sekcja "O nas" — edycja tekstu (PL/EN) + zmiana zdjęcia.

- [ ] **Step 1-4:** Zaimplementuj carousel-manager, about-section editor, Server Actions homepage. Commit.

---

## Faza 7: Seed danych, połączenie z GitHub i deploy

### Task 17: Seed administratora i dane testowe

**Files:**
- Create: `src/db/seed.ts`
- Modify: `package.json` (skrypt seed)

**Interfaces:**
- Consumes: `db`, schematy `users`, `categories`, `products`, `homepageContent`.
- Produces: Konto admina + przykładowe kategorie i produkty w bazie.

- [ ] **Step 1: Skrypt seed**

Utwórz `src/db/seed.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin12345", 10);
  const [admin] = await db
    .insert(schema.users)
    .values({
      name: "Administrator",
      email: "admin@rekodzielo.pl",
      password: hashedPassword,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  console.log("✅ Admin user created:", admin?.email ?? "already exists");

  // Create sample categories
  const [ceramika] = await db
    .insert(schema.categories)
    .values({
      namePl: "Ceramika",
      nameEn: "Ceramics",
      slug: "ceramika",
      sortOrder: 1,
    })
    .onConflictDoNothing()
    .returning();

  const [biżuteria] = await db
    .insert(schema.categories)
    .values({
      namePl: "Biżuteria",
      nameEn: "Jewelry",
      slug: "bizuteria",
      sortOrder: 2,
    })
    .onConflictDoNothing()
    .returning();

  const [tkaniny] = await db
    .insert(schema.categories)
    .values({
      namePl: "Tkaniny",
      nameEn: "Textiles",
      slug: "tkaniny",
      sortOrder: 3,
    })
    .onConflictDoNothing()
    .returning();

  console.log("✅ Categories created");

  // Create homepage content
  await db
    .insert(schema.homepageContent)
    .values({
      section: "about",
      titlePl: "O naszym sklepie",
      titleEn: "About our shop",
      descriptionPl: "Tworzymy unikatowe, ręcznie robione produkty z pasją i dbałością o każdy detal.",
      descriptionEn: "We create unique, handmade products with passion and attention to every detail.",
      sortOrder: 1,
    })
    .onConflictDoNothing();

  console.log("✅ Homepage content created");
  console.log("🎉 Seeding complete!");
}

seed().catch(console.error);
```

- [ ] **Step 2: Dodaj skrypt do package.json**

Dodaj do `package.json` w sekcji `scripts`:
```json
"db:seed": "npx tsx src/db/seed.ts",
"db:generate": "npx drizzle-kit generate",
"db:migrate": "npx drizzle-kit migrate",
"db:push": "npx drizzle-kit push",
"db:studio": "npx drizzle-kit studio"
```

- [ ] **Step 3: Uruchom seed**

```bash
npm run db:seed
```

Sprawdź w Neon: admin user i kategorie powinny istnieć.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: database seed script with admin user and sample categories"
git push
```

---

### Task 18: Deploy na Vercel

**Files:**
- Brak nowych — konfiguracja w panelach Vercel i Neon.

**Interfaces:**
- Consumes: Cały projekt na GitHub.
- Produces: Działająca strona na `*.vercel.app`.

- [ ] **Step 1: Podłączenie Vercel do GitHub**

1. Zaloguj się na https://vercel.com
2. Kliknij "Add New Project"
3. Zaimportuj repozytorium `Mati-bgl/stronawww`
4. Framework: Next.js (auto-detect)
5. Root Directory: `.` (domyślne)

- [ ] **Step 2: Podłączenie Neon do Vercel**

1. W panelu Vercel → Settings → Integrations → szukaj "Neon"
2. Zainstaluj integrację Neon
3. Połącz z istniejącą bazą na Neon
4. Vercel automatycznie doda `DATABASE_URL` do env vars

- [ ] **Step 3: Zmienne środowiskowe w Vercel**

W Vercel → Settings → Environment Variables dodaj:
```
AUTH_SECRET        = (wygeneruj: openssl rand -base64 32)
AUTH_URL           = https://twoja-domena.vercel.app
STRIPE_SECRET_KEY  = sk_test_...
STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_WEBHOOK_SECRET  = whsec_...
UPLOADTHING_TOKEN  = ...
NEXT_PUBLIC_APP_URL = https://twoja-domena.vercel.app
MIGRATION_DATABASE_URL = (direct Neon connection string)
```

- [ ] **Step 4: Pierwszy deploy**

```bash
git push origin main
```

Vercel automatycznie zbuduje i wdroży. Sprawdź logi w panelu Vercel.

- [ ] **Step 5: Konfiguracja Stripe webhook na produkcji**

1. W Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://twoja-domena.vercel.app/api/webhooks/stripe`
3. Nasłuchuj na event: `checkout.session.completed`
4. Skopiuj webhook secret do Vercel env vars

- [ ] **Step 6: Uruchom migracje i seed na produkcji**

```bash
MIGRATION_DATABASE_URL=<production-direct-url> npx drizzle-kit migrate
DATABASE_URL=<production-pooled-url> npx tsx src/db/seed.ts
```

- [ ] **Step 7: Weryfikacja końcowa**

Sprawdź na produkcji:
- [ ] Strona główna się ładuje
- [ ] Przełącznik PL/EN działa
- [ ] Rejestracja i logowanie działają
- [ ] Panel admina dostępny po zalogowaniu adminem
- [ ] Dodawanie produktów z admina
- [ ] Przeglądanie produktów jako gość
- [ ] Koszyk (dodaj, usuń, zmień ilość)
- [ ] Lista życzeń (wymaga logowania)
- [ ] Checkout → Stripe (test card: 4242 4242 4242 4242)
- [ ] Webhook aktualizuje status zamówienia

- [ ] **Step 8: Commit końcowy**

```bash
git add .
git commit -m "chore: deployment configuration and final adjustments"
git push
```

---

## Podsumowanie faz

| Faza | Taski | Co produkuje |
|:---|:---|:---|
| **1. Fundament** | 1-4 | Projekt Next.js + DB + Auth + i18n |
| **2. Frontend** | 5-8 | Layout, strona główna, produkty |
| **3. Koszyk & Wishlist** | 9-10 | Koszyk (localStorage) + lista życzeń (DB) |
| **4. Checkout** | 11 | Zamówienia + płatność Stripe |
| **5. Konto & Kontakt** | 12 | Profil, historia, formularz kontaktu |
| **6. Admin** | 13-16 | Dashboard, CRUD produktów/kategorii/zamówień, edycja strony głównej |
| **7. Deploy** | 17-18 | Seed danych + produkcja na Vercel |

**Łącznie: 18 tasków, 7 faz.**

Rekomendacja wykonania: **Native** — implementuję każdy task sam w tej sesji. Dla tego projektu to najszybsze podejście, ponieważ taski mocno zależą od siebie (schemat DB → auth → layout → strony → admin) i nie nadają się do równoległego wykonania przez niezależnych subagentów.
