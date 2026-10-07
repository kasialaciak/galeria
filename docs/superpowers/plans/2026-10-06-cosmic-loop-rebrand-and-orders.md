# Cosmic Loop – Rebranding, Bezpieczeństwo, Obsługa Zamówień i Zgodność Prawna – Plan Wdrożenia

> **Dla agentów wykonawczych:** WYMAGANY SUB-SKILL: `superpowers:subagent-driven-development` (zalecane) albo `superpowers:executing-plans`. Kroki używają checkboxów (`- [ ]`).

**Cel:** Przekształcić sklep „Rękodzieło" w sklep **Cosmic Loop** (szydełko, biżuteria z modeliny/gliny, ceramika – wszystko na zamówienie), z zatwierdzaniem zamówień i automatycznymi e-mailami, kuponami, zmianą hasła, edycją danych kontaktowych oraz zgodnością z prawem PL/UE.

**Architektura:** Rozszerzamy istniejące Next.js 16 + Drizzle/Neon. Nowe tabele: `site_settings`, `coupons`, `auth_throttle` + nowe kolumny w `orders`. Logika czysta (kupony, statusy, walidacja hasła, throttle, szablony e-mail) trafia do `src/lib/*` i jest pokryta testami Vitest. Akcje serwerowe cienko je opakowują. E-maile: Nodemailer + SMTP Gmail.

**Tech Stack:** Next.js 16, Drizzle ORM, Neon, Auth.js v5, Stripe, Zod, bcryptjs, **nowe:** `nodemailer`, `vitest`.

**Spec:** wymagania użytkowniczki z czatu z 2026-10-06 (zestawione w sekcji „Global Constraints") + audyt bezpieczeństwa z tego planu.

## Global Constraints

- Nazwa sklepu: **Cosmic Loop**. Kwadratowe logo: plik `public/logo.svg` (placeholder), podmieniany przez użytkowniczkę tą samą nazwą pliku.
- Asortyment: szydełko (pluszaki, breloczki, gumki do włosów, torebki), biżuteria z modeliny/gliny, ceramika.
- Czas wysyłki: **21 dni roboczych** – widoczny w nagłówku (pasek), na karcie produktu, w kasie, w regulaminie, w e-mailach.
- Brak widocznej dostępności/stanów magazynowych (kolumna `products.stock` zostaje w bazie, ale nie jest używana ani pokazywana).
- Konto admina: `cosmic.loop.core@gmail.com` (hasło losowe, jednorazowo wypisane, zmieniane przez użytkowniczkę).
- Instagram: `https://www.instagram.com/cosmic_loop.craft/`.
- Formularz kontaktowy → `cosmic.loop.core+shoop@gmail.com`. Powiadomienia do klientów wysyłane z konta sklepu (`From: "Cosmic Loop" <…>`, `Reply-To: cosmic.loop.core+shoop@gmail.com`).
- Pole „Uwagi do zamówienia" (max 1000 znaków) w kasie, widoczne w panelu admina.
- Kupony: typ `percent` (1–90) lub `fixed` (w groszach), ważność, limit użyć, min. kwota zamówienia, aktywny/nieaktywny.
- Zgody w kasie (wymagane serwerowo): regulamin + polityka prywatności; świadomość produktów personalizowanych bez prawa odstąpienia. Przycisk: **„Zamawiam z obowiązkiem zapłaty"**.
- Hasła: wyłącznie bcrypt (12 rund dla nowych), nigdy w logach/odpowiedziach/dokumentacji. Min. 10 znaków, max 72 (limit bcrypt).
- Wszystkie nowe akcje admina muszą sprawdzać `role === "admin"` po stronie serwera.
- Autor commitów: `Mati-bgl <matylda.bgl@gmail.com>` (inaczej Vercel blokuje deploy). Migracje bazy: ręczne skrypty SQL przez `src/db/migrate.ts` (drizzle-kit push jest interaktywny i nie działa w tym środowisku).
- Teksty UI po polsku (i18n PL/EN dla elementów nawigacji i komunikatów ogólnych; strony prawne tylko PL).

## Audyt bezpieczeństwa – znalezione luki (naprawiane w Task 0 i dalej)

| # | Luka | Naprawa |
|---|------|---------|
| S1 | `checkout.ts` ufa cenie/nazwie przesłanej z przeglądarki, gdy produktu brak w bazie (wprowadzone w ostatniej poprawce) | Odrzucać nieznane/nieopublikowane produkty; cena **tylko z bazy** |
| S2 | `registerUser`/`loginUser` zwracają `error.message` użytkownikowi (wyciek szczegółów) | Komunikaty ogólne, szczegóły tylko w logach |
| S3 | Hasło admina `admin12345` zapisane w `seed.ts`, `PROJECT_CONTEXT.md`; `AUTH_SECRET` i hasło Neon w czacie/dokumentach | Rotacja `AUTH_SECRET` i hasła Neon, usunięcie z plików, nowe hasło admina losowe |
| S4 | Brak ograniczenia prób logowania (brute force) | Tabela `auth_throttle` + blokada 15 min po 5 błędach |
| S5 | Brak nagłówków bezpieczeństwa | CSP-lite, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy w `next.config.ts` |
| S6 | Polityka hasła tylko min. 8 znaków | Min. 10, litera+cyfra, max 72 |
| S7 | Sesje JWT bez `maxAge` (domyślnie 30 dni) | `maxAge` 7 dni (zmiana hasła nie unieważnia innych sesji – znane ograniczenie JWT) |
| S8 | Webhook Stripe: brak powiadomienia i brak liczenia kuponów | Idempotentna aktualizacja `pending→paid` + licznik kuponu |
| S9 | Formularz kontaktowy bez ochrony przed spamem, wstrzyknięcie HTML do e-maila | Honeypot + escapowanie HTML w szablonach |

Dane „wrażliwe": hasła – zaszyfrowane (bcrypt, jednokierunkowo). Adresy dostaw i e-maile – szyfrowane przez Neon „at rest" (AES-256) i TLS w tranzycie; szyfrowanie na poziomie pól uznano za nadmiarowe (YAGNI) i nie jest planowane.

## Review Focus

1. Kupon obniżający kwotę poniżej minimum Stripe (2,00 zł) → odrzucić z czytelnym komunikatem (test w Task 8).
2. Kupon wygasły / wyczerpany / nieaktywny / z literówką wielkości liter → komunikat, brak rabatu (test w Task 8).
3. Podwójne kliknięcie „Zatwierdź" lub „Wyślij" → drugi e-mail NIE wychodzi (maszyna stanów, test w Task 7).
4. Niewysłany e-mail (brak/zły hasło SMTP) → status zamówienia zmieniony, admin widzi ostrzeżenie, aplikacja się nie wywala (test w Task 6).
5. Imię klienta / własna wiadomość o opóźnieniu zawierające `<script>` → w e-mailu escapowane (test w Task 6).

---

## Mapa plików

**Tworzone:**
- `vitest.config.ts` – konfiguracja testów (alias `@`).
- `src/db/migrations-manual/0001_cosmic_loop.sql` – tabele i kolumny.
- `src/db/rebrand-data.ts` – jednorazowa migracja danych (kategorie, ukrycie demo produktów).
- `src/db/set-admin.ts` – utworzenie konta admina z losowym hasłem.
- `src/lib/password.ts` (+ `.test.ts`) – schematy walidacji haseł.
- `src/lib/throttle.ts` (+ `.test.ts`) – czysta logika blokady + funkcje DB.
- `src/lib/order-status.ts` (+ `.test.ts`) – maszyna stanów zamówień.
- `src/lib/coupons.ts` (+ `.test.ts`) – walidacja i wyliczanie rabatu.
- `src/lib/email/templates.ts` (+ `.test.ts`) – szablony HTML/tekst z escapowaniem.
- `src/lib/email/mailer.ts` – wysyłka SMTP.
- `src/lib/settings.ts` – odczyt/zapis `site_settings`.
- `src/lib/legal.ts` – `TERMS_VERSION`, stałe.
- `src/actions/password.ts`, `src/actions/admin-settings.ts`, `src/actions/admin-coupons.ts`, `src/actions/admin-order-flow.ts`.
- `src/components/layout/logo.tsx`, `src/components/layout/delivery-banner.tsx`.
- `src/app/[locale]/konto/change-password-form.tsx`.
- `src/app/[locale]/admin/ustawienia/page.tsx` + `settings-form.tsx`.
- `src/app/[locale]/admin/kupony/page.tsx` + `coupon-form.tsx`.
- `src/app/[locale]/regulamin/page.tsx`, `polityka-prywatnosci/page.tsx`.
- `public/logo.svg`.

**Modyfikowane:** `src/db/schema.ts`, `src/db/seed.ts`, `src/db/migrate.ts`, `src/auth.ts`, `src/auth.config.ts`, `src/actions/auth.ts`, `src/actions/checkout.ts`, `src/actions/contact.ts`, `src/actions/admin-orders.ts`, `src/actions/admin-products.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/lib/validators.ts`, `src/lib/stripe.ts`(bez zmian, tylko użycie), `next.config.ts`, `src/app/[locale]/layout.tsx`, `src/components/layout/{header,footer,mobile-menu}.tsx`, `src/components/products/product-card.tsx`, `src/app/[locale]/produkty/[slug]/*`, `src/app/[locale]/zamowienie/checkout-client-form.tsx`, `src/app/[locale]/admin/zamowienia/*`, `src/app/[locale]/admin/produkty/nowy/product-new-form.tsx`, `src/components/admin/admin-sidebar.tsx`, `src/app/[locale]/konto/page.tsx`, `src/app/[locale]/kontakt/*`, `messages/pl.json`, `messages/en.json`, `.env.example`, `PROJECT_CONTEXT.md`.

---

### Task 0: Infrastruktura testów i higiena bezpieczeństwa

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`, `src/actions/checkout.ts`, `src/actions/auth.ts`, `src/auth.config.ts`, `next.config.ts`, `PROJECT_CONTEXT.md`, `src/db/seed.ts`, `.env.example`

**Interfaces:** Produces: komenda `npm test`; brak zmian publicznych sygnatur.

- [ ] **Step 1: Zainstaluj zależności**

```powershell
npm i nodemailer
npm i -D vitest @types/nodemailer
```

- [ ] **Step 2: `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

W `package.json` dodaj skrypt `"test": "vitest run"`.

- [ ] **Step 3 (S1): `checkout.ts`** – usuń pola `name`/`price` z `CartInputItem` oraz z `cartInput` w `checkout-client-form.tsx`. Zastąp budowę `verifiedItems`:

```ts
const verifiedItems = cartItems.map((item) => {
  const dbProd = productMap.get(item.productId);
  if (!dbProd) return null;
  return {
    productId: item.productId,
    productName: dbProd.name,
    quantity: Math.min(Math.max(1, Math.floor(item.quantity)), 20),
    unitPrice: dbProd.price,
  };
});
if (verifiedItems.some((i) => i === null)) {
  return { error: "Jeden z produktów w koszyku nie jest już dostępny. Wyczyść koszyk i dodaj produkty ponownie." };
}
```

Zapytanie o produkty ma filtrować `eq(products.isPublished, true)`; usuń `catch` połykający błąd bazy – przy błędzie DB zwróć `{ error: "Błąd serwera, spróbuj ponownie." }`. Dalej używaj `verifiedItems as NonNullable<…>[]`.

- [ ] **Step 4 (S2): `src/actions/auth.ts`** – w obu `catch` usuń `error.message` z odpowiedzi:

```ts
return { success: false, error: "Wystąpił problem. Spróbuj ponownie za chwilę." };
```
(szczegóły zostają w `console.error`). Przy `CredentialsSignin` zostaje „Nieprawidłowy adres email lub hasło".

- [ ] **Step 5 (S7): `auth.config.ts`** – `session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }`.

- [ ] **Step 6 (S5): `next.config.ts`** – dodaj `async headers()` zwracający dla `/(.*)`:

```ts
[
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]
```
(CSP pełny pomijamy – ryzyko zepsucia Stripe/UploadThing/next-intl; do rozważenia osobno.)

- [ ] **Step 7 (S3): higiena sekretów.** Usuń z `PROJECT_CONTEXT.md` hasło admina i wartość `AUTH_SECRET` (zostaw tylko nazwy zmiennych). W `seed.ts` zastąp stałe hasło odczytem `process.env.ADMIN_INITIAL_PASSWORD` i `process.env.ADMIN_EMAIL`; gdy brak – pomiń tworzenie admina z komunikatem. Utwórz `.env.example` z samymi nazwami zmiennych (`DATABASE_URL`, `MIGRATION_DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `NEXT_PUBLIC_APP_URL`, `STRIPE_*`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_INBOX`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`).

- [ ] **Step 8: Weryfikacja i commit**

```powershell
npm test   # brak testów -> exit 0 z "No test files" (dopuszczalne), potem po Task 1+ rośnie
npm run build
git add -A; git commit -m "chore(security): test infra, trust only DB prices, generic auth errors, headers, session maxAge, remove secrets from docs"
```
Oczekiwane: build kończy się kodem 0.

> **Działania ręczne użytkowniczki (poza kodem), opisane krok po kroku w czacie:** rotacja `AUTH_SECRET` na Vercel, reset hasła użytkownika Neon i aktualizacja `DATABASE_URL`/`MIGRATION_DATABASE_URL` na Vercel i w `.env.local`.

---

### Task 1: Migracja bazy (tabele i kolumny)

**Files:**
- Create: `src/db/migrations-manual/0001_cosmic_loop.sql`
- Modify: `src/db/schema.ts`, `src/db/migrate.ts`

**Interfaces:** Produces: tabele `siteSettings`, `coupons`, `authThrottle` (eksporty z `schema.ts`) oraz kolumny `orders.customerNotes`, `couponCode`, `discountAmount`, `trackingUrl`, `acceptedAt`, `shippedAt`, `termsAcceptedAt`, `termsVersion`, `customWaiverAcceptedAt`, `delayNotifiedAt`.

- [ ] **Step 1: SQL (idempotentny)** – `0001_cosmic_loop.sql`, instrukcje oddzielone `--> statement-breakpoint`:

```sql
CREATE TABLE IF NOT EXISTS "site_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text DEFAULT '' NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "type" text NOT NULL,
  "value" integer NOT NULL,
  "min_order_amount" integer DEFAULT 0 NOT NULL,
  "max_uses" integer,
  "used_count" integer DEFAULT 0 NOT NULL,
  "expires_at" timestamp,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_throttle" (
  "key" text PRIMARY KEY NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "locked_until" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_notes" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_url" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "accepted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipped_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "terms_version" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "custom_waiver_accepted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delay_notified_at" timestamp;
```

- [ ] **Step 2: `schema.ts`** – dodaj do `orders`:

```ts
customerNotes: text("customer_notes"),
couponCode: text("coupon_code"),
discountAmount: integer("discount_amount").default(0).notNull(),
trackingUrl: text("tracking_url"),
acceptedAt: timestamp("accepted_at"),
shippedAt: timestamp("shipped_at"),
termsAcceptedAt: timestamp("terms_accepted_at"),
termsVersion: text("terms_version"),
customWaiverAcceptedAt: timestamp("custom_waiver_accepted_at"),
delayNotifiedAt: timestamp("delay_notified_at"),
```
oraz nowe tabele:

```ts
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").default("").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // percent | fixed
  value: integer("value").notNull(), // % lub grosze
  minOrderAmount: integer("min_order_amount").default(0).notNull(),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authThrottle = pgTable("auth_throttle", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

- [ ] **Step 3: `migrate.ts`** – zamiast stałej ścieżki czytaj plik z `process.argv[2]` (domyślnie `drizzle/0000_cuddly_luminals.sql`). Zachowaj obecną obsługę „already exists".

- [ ] **Step 4: Uruchom i zweryfikuj**

```powershell
npx tsx src/db/migrate.ts src/db/migrations-manual/0001_cosmic_loop.sql
```
Oczekiwane: `[n/n] Sukces` dla wszystkich 13 instrukcji. Następnie `npm run build` (kod 0).

- [ ] **Step 5: Commit** – `git commit -m "feat(db): add site_settings, coupons, auth_throttle and order workflow columns"`

---

### Task 2: Polityka haseł i zmiana hasła (z throttlingiem)

**Files:**
- Create: `src/lib/password.ts`, `src/lib/password.test.ts`, `src/lib/throttle.ts`, `src/lib/throttle.test.ts`, `src/actions/password.ts`, `src/app/[locale]/konto/change-password-form.tsx`
- Modify: `src/lib/validators.ts`, `src/auth.ts`, `src/actions/auth.ts`, `src/app/[locale]/konto/page.tsx`

**Interfaces:**
- Produces: `newPasswordSchema`, `changePasswordSchema` (`password.ts`); `nextThrottleState(state, now)`, `isLocked(state, now)`, `checkThrottle(key)`, `recordFailure(key)`, `clearThrottle(key)` (`throttle.ts`); `changePassword(prev, formData): Promise<{success?: boolean; error?: string; fieldErrors?: Record<string,string[]>}>` (`actions/password.ts`).

- [ ] **Step 1: Test `password.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { newPasswordSchema, changePasswordSchema } from "./password";

describe("newPasswordSchema", () => {
  it("odrzuca hasła krótsze niż 10 znaków", () => {
    expect(newPasswordSchema.safeParse("Abc12345").success).toBe(false);
  });
  it("wymaga litery i cyfry", () => {
    expect(newPasswordSchema.safeParse("abcdefghijkl").success).toBe(false);
    expect(newPasswordSchema.safeParse("1234567890123").success).toBe(false);
  });
  it("odrzuca hasła dłuższe niż 72 znaki (limit bcrypt)", () => {
    expect(newPasswordSchema.safeParse("a1".repeat(40)).success).toBe(false);
  });
  it("akceptuje poprawne hasło", () => {
    expect(newPasswordSchema.safeParse("Kotek12345x").success).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  const base = { currentPassword: "Stare12345x", newPassword: "Nowe12345xyz", confirmPassword: "Nowe12345xyz" };
  it("akceptuje poprawne dane", () => {
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
  });
  it("odrzuca niezgodne potwierdzenie", () => {
    expect(changePasswordSchema.safeParse({ ...base, confirmPassword: "inne" }).success).toBe(false);
  });
  it("odrzuca nowe hasło równe obecnemu", () => {
    expect(changePasswordSchema.safeParse({ ...base, newPassword: base.currentPassword, confirmPassword: base.currentPassword }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Uruchom** `npx vitest run src/lib/password.test.ts` – oczekiwane FAIL (brak modułu).

- [ ] **Step 3: `password.ts`**

```ts
import { z } from "zod";

export const newPasswordSchema = z
  .string()
  .min(10, "Hasło musi mieć min. 10 znaków")
  .max(72, "Hasło może mieć maks. 72 znaki")
  .regex(/[A-Za-z]/, "Hasło musi zawierać literę")
  .regex(/\d/, "Hasło musi zawierać cyfrę");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Podaj obecne hasło"),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Hasła nie są takie same",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "Nowe hasło musi się różnić od obecnego",
  });
```

W `validators.ts` zmień `registerSchema.password` na `newPasswordSchema` (import z `./password`). Minimalna długość w polu rejestracji (`minLength={8}` w `rejestracja/page.tsx`) → `10`, a etykieta „min. 10 znaków".

- [ ] **Step 4: Uruchom testy** – oczekiwane PASS.

- [ ] **Step 5: Test `throttle.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { nextThrottleState, isLocked, MAX_ATTEMPTS, LOCK_MINUTES } from "./throttle";

const now = new Date("2026-01-01T12:00:00Z");

describe("throttle", () => {
  it("zlicza nieudane próby bez blokady poniżej limitu", () => {
    let s = { attempts: 0, lockedUntil: null as Date | null };
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) s = nextThrottleState(s, now);
    expect(isLocked(s, now)).toBe(false);
  });
  it("blokuje po przekroczeniu limitu", () => {
    let s = { attempts: 0, lockedUntil: null as Date | null };
    for (let i = 0; i < MAX_ATTEMPTS; i++) s = nextThrottleState(s, now);
    expect(isLocked(s, now)).toBe(true);
  });
  it("odblokowuje po upływie czasu blokady", () => {
    let s = { attempts: 0, lockedUntil: null as Date | null };
    for (let i = 0; i < MAX_ATTEMPTS; i++) s = nextThrottleState(s, now);
    const later = new Date(now.getTime() + (LOCK_MINUTES + 1) * 60_000);
    expect(isLocked(s, later)).toBe(false);
  });
});
```

- [ ] **Step 6: `throttle.ts`**

```ts
import { db } from "@/db";
import { authThrottle } from "@/db/schema";
import { eq } from "drizzle-orm";

export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export type ThrottleState = { attempts: number; lockedUntil: Date | null };

export function isLocked(s: ThrottleState, now = new Date()): boolean {
  return !!s.lockedUntil && s.lockedUntil.getTime() > now.getTime();
}

export function nextThrottleState(s: ThrottleState, now = new Date()): ThrottleState {
  const attempts = (s.lockedUntil && !isLocked(s, now) ? 0 : s.attempts) + 1;
  const lockedUntil =
    attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * 60_000) : null;
  return { attempts, lockedUntil };
}

async function load(key: string): Promise<ThrottleState> {
  const [row] = await db.select().from(authThrottle).where(eq(authThrottle.key, key)).limit(1);
  return row ? { attempts: row.attempts, lockedUntil: row.lockedUntil } : { attempts: 0, lockedUntil: null };
}

export async function checkThrottle(key: string): Promise<boolean> {
  return isLocked(await load(key));
}

export async function recordFailure(key: string): Promise<void> {
  const next = nextThrottleState(await load(key));
  await db
    .insert(authThrottle)
    .values({ key, ...next })
    .onConflictDoUpdate({ target: authThrottle.key, set: { ...next, updatedAt: new Date() } });
}

export async function clearThrottle(key: string): Promise<void> {
  await db.delete(authThrottle).where(eq(authThrottle.key, key));
}
```

- [ ] **Step 7: Uruchom testy** (`npx vitest run`) – PASS.

- [ ] **Step 8: Podłącz throttle w logowaniu.** W `auth.ts` `authorize`: przed zapytaniem `if (await checkThrottle("login:" + email.toLowerCase())) return null;`; przy złym hasle/braku użytkownika `await recordFailure(...)`; przy sukcesie `await clearThrottle(...)`. Zawsze wykonuj `bcrypt.compare` (na atrapie hasha, gdy brak użytkownika) aby nie zdradzać istnienia konta czasem odpowiedzi. Pozostaw komunikat ogólny.

- [ ] **Step 9: `actions/password.ts`**

```ts
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
    return { error: "Popraw dane formularza.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const key = "pw:" + session.user.id;
  if (await checkThrottle(key)) {
    return { error: "Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut." };
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const ok = user?.password
      ? await bcrypt.compare(parsed.data.currentPassword, user.password)
      : false;
    if (!ok) {
      await recordFailure(key);
      return { error: "Obecne hasło jest nieprawidłowe.", fieldErrors: { currentPassword: ["Nieprawidłowe hasło"] } };
    }
    const hash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.update(users).set({ password: hash, updatedAt: new Date() }).where(eq(users.id, user.id));
    await clearThrottle(key);
    return { success: true };
  } catch (e) {
    console.error("changePassword error:", e);
    return { error: "Wystąpił problem. Spróbuj ponownie za chwilę." };
  }
}
```

- [ ] **Step 10: UI** – `change-password-form.tsx` (client, `useActionState(changePassword, null)`): trzy pola `type="password"` (`currentPassword` z `autoComplete="current-password"`, `newPassword`, `confirmPassword` z `autoComplete="new-password"`), komunikaty `fieldErrors`, toast przy sukcesie i reset formularza. Wstaw do `konto/page.tsx` jako karta „Bezpieczeństwo – zmiana hasła" pod kartą profilu (lewa kolumna). Rejestracja (`registerUser`) używa bcrypt 12 rund (zmień `10` → `12`).

- [ ] **Step 11: Weryfikacja** – `npm test` (PASS), `npm run build` (0). Ręcznie po wdrożeniu: zła hasło ×5 → blokada; poprawna zmiana → logowanie nowym hasłem działa.

- [ ] **Step 12: Commit** – `git commit -m "feat(auth): stronger password policy, change-password form, login throttling"`

---

### Task 3: Ustawienia sklepu (kontakt, Instagram, dane sprzedawcy) w panelu admina

**Files:**
- Create: `src/lib/settings.ts`, `src/actions/admin-settings.ts`, `src/app/[locale]/admin/ustawienia/page.tsx`, `src/app/[locale]/admin/ustawienia/settings-form.tsx`
- Modify: `src/components/admin/admin-sidebar.tsx`, `src/lib/validators.ts`

**Interfaces:**
- Produces: `type SiteSettings = { contactEmail; contactPhone; instagramUrl; sellerName; sellerAddress; sellerNip; shippingDays }` (wszystko `string`), `getSettings(): Promise<SiteSettings>`, `DEFAULT_SETTINGS`, `settingsSchema` (zod), `updateSettings(prev, formData)`.

- [ ] **Step 1: `settings.ts`**

```ts
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export type SiteSettings = {
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  sellerName: string;
  sellerAddress: string;
  sellerNip: string;
  shippingDays: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  contactEmail: "cosmic.loop.core+shoop@gmail.com",
  contactPhone: "",
  instagramUrl: "https://www.instagram.com/cosmic_loop.craft/",
  sellerName: "",
  sellerAddress: "",
  sellerNip: "",
  shippingDays: "21",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.select().from(siteSettings);
    const merged: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.key in DEFAULT_SETTINGS && r.value !== "") merged[r.key] = r.value;
    return merged as SiteSettings;
  } catch (e) {
    console.error("getSettings failed:", e);
    return DEFAULT_SETTINGS;
  }
}
```

- [ ] **Step 2: `settingsSchema` w `validators.ts`** – `contactEmail: z.string().email()`, `contactPhone: z.string().max(30)`, `instagramUrl: z.string().url().refine(u => u.startsWith("https://www.instagram.com/") || u.startsWith("https://instagram.com/"), "Podaj link do Instagrama")`, `sellerName/sellerAddress: z.string().max(200)`, `sellerNip: z.string().regex(/^(\d{10})?$/, "NIP: 10 cyfr lub puste")`, `shippingDays: z.string().regex(/^\d{1,3}$/)`.

- [ ] **Step 3: `updateSettings`** – `"use server"`; wymaga `role === "admin"`; waliduje; upsert każdego klucza (`onConflictDoUpdate` na `siteSettings.key`); `revalidatePath("/", "layout")`; zwraca `{ success, error?, fieldErrors? }`.

- [ ] **Step 4: Strona `/admin/ustawienia`** – serwerowa, ładuje `getSettings()`, renderuje `SettingsForm` (client, `useActionState`) z sekcjami „Kontakt i social media", „Dane sprzedawcy (do regulaminu i stopki)", „Czas realizacji". Dodaj link „Ustawienia sklepu" (ikona `Settings`) w `admin-sidebar.tsx`.

- [ ] **Step 5: Weryfikacja** – `npm run build` (0). Ręcznie: zapis zmienia wartości po odświeżeniu; zły link IG daje błąd pola.

- [ ] **Step 6: Commit** – `git commit -m "feat(admin): editable store settings (contact, Instagram, seller data)"`

---

### Task 4: Rebranding Cosmic Loop, asortyment, termin 21 dni, brak stanów magazynowych

**Files:**
- Create: `public/logo.svg`, `src/components/layout/logo.tsx`, `src/components/layout/delivery-banner.tsx`, `src/db/rebrand-data.ts`
- Modify: `src/components/layout/{header,footer,mobile-menu}.tsx`, `src/app/[locale]/layout.tsx`, `messages/pl.json`, `messages/en.json`, `src/components/products/product-card.tsx`, `src/app/[locale]/produkty/[slug]/page.tsx`, `src/app/[locale]/produkty/[slug]/product-detail-actions.tsx`, `src/app/[locale]/admin/produkty/nowy/product-new-form.tsx`, `src/actions/admin-products.ts`, `src/lib/validators.ts`, `src/db/seed.ts`, `src/components/home/about-section.tsx` (jeśli zawiera nazwę)

**Interfaces:** Consumes: `getSettings()` (Task 3). Produces: `<Logo size?: number />`, `<DeliveryBanner days: string />`.

- [ ] **Step 1: `public/logo.svg`** – kwadratowy placeholder 128×128 (zaokrąglony kwadrat w kolorze `forest` z białą pętlą/inicjałami „CL"). `logo.tsx`:

```tsx
import Image from "next/image";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="Cosmic Loop – logo" width={size} height={size} className="rounded-md" priority />
      <span className="font-serif text-xl font-bold text-forest">Cosmic Loop</span>
    </span>
  );
}
```
Dodaj komentarz w pliku: „Podmień `public/logo.svg` własnym kwadratowym logo (ta sama nazwa pliku)."

- [ ] **Step 2: Nagłówek/stopka/menu mobilne** – zastąp tekst „Rękodzieło" komponentem `<Logo />` (header, mobile-menu) i nazwą „Cosmic Loop" (footer, copyright). Stopka dodatkowo: ikona Instagram (lucide `Instagram`) z `getSettings().instagramUrl` (`target="_blank" rel="noopener noreferrer"`), e-mail kontaktowy, linki „Regulamin" i „Polityka prywatności" (strony z Task 9), tekst opisowy „Ręcznie robione na zamówienie: szydełko, biżuteria z modeliny i gliny, ceramika."

- [ ] **Step 3: Pasek terminu** – `delivery-banner.tsx` (server): cienki pasek nad nagłówkiem „Każdy produkt jest robiony ręcznie na zamówienie – czas realizacji i wysyłki do {days} dni roboczych." Umieść w `layout.tsx` nad `<Header />`. W `layout.tsx` zmień `metadata` (`title` template „%s | Cosmic Loop", opis, `openGraph.siteName`). Zaktualizuj `messages/pl.json` i `en.json` (klucze marki/pasek; EN: „Every item is handmade to order – production and shipping take up to {days} business days.").

- [ ] **Step 4: Brak stanów magazynowych** – usuń z `product-card.tsx` prop `stock` i wszelkie „Pozostało X"/„Brak w magazynie"/blokady przycisku „Dodaj do koszyka" zależne od `stock`; usuń to samo w `produkty/[slug]/page.tsx` i `product-detail-actions.tsx`; w miejsce wstaw znacznik „Robione na zamówienie • do {days} dni roboczych". W `product-new-form.tsx` usuń pole „Stan magazynowy", w `productSchema` usuń `stock`, w `admin-products.ts` ustaw przy zapisie `stock: 0`. Usuń sprawdzanie `stock` w `checkout.ts`, jeśli jest.

- [ ] **Step 5: Dane: kategorie i produkty demo** – `rebrand-data.ts` (jednorazowy, idempotentny):

```ts
// Pseudokod struktury – implementacja używa db z src/db i schema.
// 1. upsert kategorii głównej: slug "szydelko", "Szydełko"/"Crochet"
// 2. upsert podkategorii (parentId = szydelko.id): pluszaki, breloczki, gumki-do-wlosow, torebki
// 3. update kategorii slug "bizuteria" -> namePl "Biżuteria z modeliny i gliny", nameEn "Polymer & Clay Jewelry"
// 4. kategoria "ceramika" bez zmian
// 5. kategoria "tkaniny": products.categoryId -> null dla jej produktów, potem usunięcie kategorii
// 6. update products set is_published=false where id like 'prod-%'  (NIE usuwamy: FK z order_items)
```
Implementacja realnie używa `db.insert(...).onConflictDoUpdate/DoNothing`, `db.update`, `db.delete` z `drizzle-orm`; wypisuje podsumowanie. `seed.ts`: zamień kategorie/podkategorie/produkty demo na nowy asortyment (kategorie jak wyżej; **bez** produktów demo – użytkowniczka doda własne w panelu), karuzela i „O nas" z tekstami o Cosmic Loop (szydełko, modelina/glina, ceramika).

- [ ] **Step 6: Uruchom i zweryfikuj**

```powershell
npx tsx src/db/rebrand-data.ts
npm run build
```
Oczekiwane: build kod 0; na `/produkty` widoczne nowe kategorie, brak informacji o stanie magazynu; pasek 21 dni widoczny na każdej stronie.

- [ ] **Step 7: Commit** – `git commit -m "feat(brand): Cosmic Loop branding, logo slot, 21-day notice, made-to-order catalogue"`

---

### Task 5: Konto administratora na `cosmic.loop.core@gmail.com`

**Files:** Create: `src/db/set-admin.ts`

**Interfaces:** Produces: komenda `npx tsx src/db/set-admin.ts`.

- [ ] **Step 1: Skrypt** – tworzy (lub aktualizuje) użytkownika `cosmic.loop.core@gmail.com` z rolą `admin` i **losowym hasłem** `crypto.randomBytes(12).toString("base64url")` (hash bcrypt 12), wypisuje hasło **raz** do konsoli. Stare konto `admin@rekodzielo.pl`: jeśli nie ma powiązanych zamówień – usuń; jeśli ma – ustaw `role: "user"` i zmień hasło na losowe, nieznane.

```ts
import crypto from "crypto";
import bcrypt from "bcryptjs";
// …wczytanie env jak w seed.ts…
const password = crypto.randomBytes(12).toString("base64url");
const hash = await bcrypt.hash(password, 12);
// upsert admina, obsługa starego konta, console.log("Hasło (zapisz i zmień po zalogowaniu):", password);
```

- [ ] **Step 2: Uruchom** `npx tsx src/db/set-admin.ts`; przekaż hasło użytkowniczce w czacie (jednorazowo). **Nie** zapisuj go w żadnym pliku ani commicie.

- [ ] **Step 3: Weryfikacja** – logowanie na stronie produkcyjnej nowym adresem; `/admin` dostępny; stare konto nie loguje.

- [ ] **Step 4: Commit** – `git commit -m "feat(admin): script to provision shop owner admin account"` (tylko skrypt).

---

### Task 6: Wysyłka e-maili (Gmail SMTP) i szablony

**Files:**
- Create: `src/lib/email/templates.ts`, `src/lib/email/templates.test.ts`, `src/lib/email/mailer.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `escapeHtml(s: string): string`; `orderAcceptedEmail(o: { orderNumber; name; days }): {subject; html; text}`; `orderShippedEmail(o: { orderNumber; name; trackingUrl?: string | null }): {subject; html; text}`; `orderDelayedEmail(o: { orderNumber; name; message: string }): {subject; html; text}`; `orderRejectedEmail(o: { orderNumber; name; reason: string }): {subject; html; text}`; `sendMail(m: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<{ ok: boolean; error?: string }>`.

- [ ] **Step 1: Test `templates.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { escapeHtml, orderDelayedEmail, orderShippedEmail, orderAcceptedEmail } from "./templates";

describe("escapeHtml", () => {
  it("escapuje znaki specjalne", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });
});

describe("szablony", () => {
  it("nie wstawia surowego HTML z imienia klienta", () => {
    const m = orderAcceptedEmail({ orderNumber: "ZAM-1", name: "<img src=x onerror=1>", days: "21" });
    expect(m.html).not.toContain("<img src=x");
    expect(m.html).toContain("&lt;img");
  });
  it("nie wstawia surowego HTML z własnej wiadomości o opóźnieniu", () => {
    const m = orderDelayedEmail({ orderNumber: "ZAM-1", name: "Ala", message: "<script>1</script>" });
    expect(m.html).not.toContain("<script>");
  });
  it("dodaje link do śledzenia tylko dla bezpiecznego https", () => {
    const ok = orderShippedEmail({ orderNumber: "ZAM-1", name: "Ala", trackingUrl: "https://inpost.pl/x" });
    expect(ok.html).toContain("https://inpost.pl/x");
    const bad = orderShippedEmail({ orderNumber: "ZAM-1", name: "Ala", trackingUrl: "javascript:alert(1)" });
    expect(bad.html).not.toContain("javascript:");
  });
  it("zawiera numer zamówienia w temacie", () => {
    expect(orderAcceptedEmail({ orderNumber: "ZAM-9", name: "Ala", days: "21" }).subject).toContain("ZAM-9");
  });
});
```

- [ ] **Step 2: Uruchom** – FAIL (brak modułu).

- [ ] **Step 3: `templates.ts`** – implementacja: wspólna funkcja `layout(title, bodyHtml)` (prosty, czytelny HTML w kolorach marki, stopka „Cosmic Loop"), każdy dynamiczny tekst przechodzi przez `escapeHtml`; `trackingUrl` dołączany tylko gdy `/^https:\/\//i` i po `escapeHtml`. Treści (PL):
  - zaakceptowane: „Twoje zamówienie {nr} zostało zatwierdzone i rozpoczynamy jego wykonanie. Czas realizacji i wysyłki: do {days} dni roboczych."
  - wysłane: „Twoje zamówienie {nr} zostało wysłane." + opcjonalny link „Śledź przesyłkę".
  - opóźnienie: „Informacja o możliwym opóźnieniu zamówienia {nr}" + escapowana wiadomość admina (nowe linie → `<br>` po escapowaniu).
  - odrzucone/anulowane: „Zamówienie {nr} zostało anulowane, zwrot środków nastąpi na Twoje konto/kartę. Powód: {reason}".

```ts
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

- [ ] **Step 4: `mailer.ts`**

```ts
import nodemailer from "nodemailer";

export async function sendMail(m: {
  to: string; subject: string; html: string; text: string; replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("sendMail: brak GMAIL_USER / GMAIL_APP_PASSWORD");
    return { ok: false, error: "E-mail nie jest skonfigurowany" };
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"Cosmic Loop" <${process.env.MAIL_FROM || user}>`,
      to: m.to,
      replyTo: m.replyTo || "cosmic.loop.core+shoop@gmail.com",
      subject: m.subject,
      html: m.html,
      text: m.text,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendMail failed:", e);
    return { ok: false, error: "Nie udało się wysłać e-maila" };
  }
}
```

- [ ] **Step 5: Test braku konfiguracji** – dopisz w `templates.test.ts`? Nie; dodaj `mailer.test.ts`: po `delete process.env.GMAIL_USER` `sendMail(...)` zwraca `{ ok: false }` i **nie rzuca** (Review Focus #4). Uruchom `npx vitest run` – PASS.

- [ ] **Step 6: Commit** – `git commit -m "feat(email): Gmail SMTP mailer and escaped order email templates"`

> **Uwaga o adresie nadawcy:** Gmail SMTP zwykle podpisuje wiadomość adresem uwierzytelnionego konta. Wysyłamy z `cosmic.loop.core@gmail.com` (`MAIL_FROM` opcjonalne), a `Reply-To` ustawiamy na `cosmic.loop.core+shoop@gmail.com`. Po wdrożeniu wysyłamy testowy e-mail i sprawdzamy, jak wygląda nadawca; jeśli Gmail zachowa alias `+shoop` – bez zmian, jeśli nie – to akceptowalne.

---

### Task 7: Zatwierdzanie zamówień, wysyłka i e-maile jednym kliknięciem

**Files:**
- Create: `src/lib/order-status.ts`, `src/lib/order-status.test.ts`, `src/actions/admin-order-flow.ts`
- Modify: `src/app/[locale]/admin/zamowienia/page.tsx`, `src/app/[locale]/admin/zamowienia/order-status-selector.tsx` (zastąp przyciskami akcji), `src/actions/admin-orders.ts` (dodaj nowe pola do selecta i usuń swobodną `updateOrderStatusAction` – patrz Step 5), `src/app/[locale]/konto/page.tsx` (etykiety statusów), `src/app/api/webhooks/stripe/route.ts`

**Interfaces:**
- Produces: `OrderStatus`, `canTransition(from, to): boolean`, `STATUS_LABELS_PL`; akcje `acceptOrderAction(orderId)`, `shipOrderAction(orderId, trackingUrl?: string)`, `sendDelayNoticeAction(orderId, message: string)`, `rejectOrderAction(orderId, reason: string)` – każda zwraca `{ success: boolean; error?: string; emailSent?: boolean }`.

- [ ] **Step 1: Test `order-status.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { canTransition } from "./order-status";

describe("canTransition", () => {
  it("pozwala na główną ścieżkę", () => {
    expect(canTransition("pending", "paid")).toBe(true);
    expect(canTransition("paid", "accepted")).toBe(true);
    expect(canTransition("accepted", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
  });
  it("blokuje powtórne zatwierdzenie (brak podwójnego e-maila)", () => {
    expect(canTransition("accepted", "accepted")).toBe(false);
    expect(canTransition("shipped", "accepted")).toBe(false);
  });
  it("blokuje wysyłkę niezatwierdzonego zamówienia", () => {
    expect(canTransition("paid", "shipped")).toBe(false);
    expect(canTransition("pending", "accepted")).toBe(false);
  });
  it("nie pozwala wznowić anulowanego", () => {
    expect(canTransition("cancelled", "paid")).toBe(false);
  });
});
```

- [ ] **Step 2: Uruchom** – FAIL.

- [ ] **Step 3: `order-status.ts`**

```ts
export type OrderStatus = "pending" | "paid" | "accepted" | "shipped" | "delivered" | "cancelled";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["accepted", "cancelled"],
  accepted: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export const STATUS_LABELS_PL: Record<OrderStatus, string> = {
  pending: "Oczekuje na płatność",
  paid: "Opłacone – czeka na zatwierdzenie",
  accepted: "Zatwierdzone – w realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
};
```

- [ ] **Step 4: Uruchom testy** – PASS.

- [ ] **Step 5: `admin-order-flow.ts`** – każda akcja: (1) sprawdza `role === "admin"`; (2) wczytuje zamówienie + e-mail klienta (join `users`); (3) `canTransition(order.status, target)` inaczej `{ success:false, error:"Ta operacja nie jest teraz dozwolona" }`; (4) **atomowa** aktualizacja `where id = ? and status = <oczekiwany>` z `.returning()` – jeśli 0 wierszy (kliknięcie równoległe), zwróć błąd i **nie** wysyłaj e-maila; (5) po sukcesie wywołuje `sendMail` z odpowiednim szablonem; zwraca `emailSent`; (6) `revalidatePath("/admin/zamowienia")`. Szczegóły:
  - `acceptOrderAction`: `paid → accepted`, `acceptedAt = now`, e-mail `orderAcceptedEmail` (dni z `getSettings().shippingDays`).
  - `shipOrderAction(orderId, trackingUrl?)`: `accepted → shipped`, `shippedAt = now`, `trackingUrl` zapisany tylko gdy `z.string().url().startsWith("https://")`, e-mail `orderShippedEmail`.
  - `sendDelayNoticeAction(orderId, message)`: dozwolone gdy status ∈ {`paid`,`accepted`}; `message` walidowane 5–1000 znaków; ustawia `delayNotifiedAt`; **nie** zmienia statusu; wysyła `orderDelayedEmail` (można wysłać wielokrotnie – to świadoma akcja admina).
  - `rejectOrderAction(orderId, reason)`: `paid|accepted → cancelled`; jeśli `stripePaymentIntentId` istnieje – `stripe.refunds.create({ payment_intent })` **przed** zmianą statusu (błąd refundu → zwróć błąd i zostaw status); e-mail `orderRejectedEmail`.
  Usuń z `admin-orders.ts` ogólną `updateOrderStatusAction` (swobodna zmiana statusu omijałaby maszynę stanów i e-maile); dodaj do selecta w `getAllAdminOrders` pola: `customerNotes, couponCode, discountAmount, trackingUrl, acceptedAt, shippedAt, delayNotifiedAt`.

- [ ] **Step 6: UI admina** – w każdej karcie zamówienia (`zamowienia/page.tsx`): badge statusu (`STATUS_LABELS_PL`), blok „Uwagi klienta" (tekst escapowany przez React), kupon i rabat, oraz przyciski zależne od statusu: dla `paid` – **„Zatwierdź zamówienie"** (zielony) i „Odrzuć i zwróć pieniądze" (z `confirm()`); dla `accepted` – pole „Link do śledzenia (opcjonalnie)" + **„Oznacz jako wysłane"**; dla `paid`/`accepted` – „Wyślij informację o opóźnieniu" (rozwijane pole tekstowe z domyślnym tekstem „Z powodu dużej liczby zamówień termin realizacji może się wydłużyć o … dni. Dziękujemy za cierpliwość!"). Po akcji toast: sukces; gdy `emailSent === false` – żółte ostrzeżenie „Status zmieniony, ale e-mail nie został wysłany". Przyciski blokowane w trakcie (`useTransition`).

- [ ] **Step 7: Webhook (S8)** – w `checkout.session.completed`: aktualizuj **tylko** gdy aktualny status to `pending` (`.where(and(eq(orders.id, orderId), eq(orders.status, "pending")))` + `.returning()`); jeśli zwrócono wiersz: (a) jeśli `couponCode` – `update coupons set used_count = used_count + 1 where code = ?`; (b) wyślij e-mail do `cosmic.loop.core+shoop@gmail.com` „Nowe opłacone zamówienie {nr} – czeka na zatwierdzenie" (numer, kwota, link do `/admin/zamowienia`) oraz potwierdzenie przyjęcia zamówienia do klienta (krótkie: „Dziękujemy, otrzymaliśmy zamówienie i płatność. Zatwierdzimy je wkrótce"). Błąd e-maila nie może zwrócić statusu 5xx do Stripe (łap i loguj), inaczej Stripe będzie ponawiać webhook.

- [ ] **Step 8: Etykiety statusów** w `konto/page.tsx` (`getStatusBadge`) – użyj `STATUS_LABELS_PL`.

- [ ] **Step 9: Weryfikacja** – `npm test` PASS, `npm run build` 0. Po wdrożeniu (tryb testowy Stripe, karta `4242 4242 4242 4242`): złóż zamówienie → admin dostaje e-mail → „Zatwierdź" → klient dostaje e-mail → „Oznacz jako wysłane" → e-mail z linkiem; drugi klik „Zatwierdź" nie wysyła nic.

- [ ] **Step 10: Commit** – `git commit -m "feat(orders): approval workflow with one-click emails, delay notices, refunds on reject"`

---

### Task 8: Uwagi do zamówienia i kupony rabatowe

**Files:**
- Create: `src/lib/coupons.ts`, `src/lib/coupons.test.ts`, `src/actions/admin-coupons.ts`, `src/app/[locale]/admin/kupony/page.tsx`, `src/app/[locale]/admin/kupony/coupon-form.tsx`
- Modify: `src/lib/validators.ts`, `src/actions/checkout.ts`, `src/app/[locale]/zamowienie/checkout-client-form.tsx`, `src/components/admin/admin-sidebar.tsx`

**Interfaces:**
- Produces: `type CouponRow`, `validateCoupon(c: CouponRow, itemsTotal: number, shippingCost: number, now?: Date): { ok: true; discount: number } | { ok: false; reason: string }`, `MIN_STRIPE_TOTAL = 200`, `normalizeCouponCode(s: string): string`; akcje `createCoupon`, `toggleCoupon(id, isActive)`, `deleteCoupon(id)`; w `checkout.ts` pole formularza `couponCode` i `customerNotes`.

- [ ] **Step 1: Test `coupons.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { validateCoupon, normalizeCouponCode, type CouponRow } from "./coupons";

const base: CouponRow = {
  type: "percent", value: 10, minOrderAmount: 0, maxUses: null,
  usedCount: 0, expiresAt: null, isActive: true,
};
const now = new Date("2026-06-01T12:00:00Z");

describe("normalizeCouponCode", () => {
  it("ignoruje wielkość liter i spacje", () => {
    expect(normalizeCouponCode("  Lato10 ")).toBe("LATO10");
  });
});

describe("validateCoupon", () => {
  it("liczy rabat procentowy tylko od wartości produktów", () => {
    expect(validateCoupon(base, 10000, 1200, now)).toEqual({ ok: true, discount: 1000 });
  });
  it("kwotowy nie przekracza wartości produktów", () => {
    const r = validateCoupon({ ...base, type: "fixed", value: 50000 }, 8900, 0, now);
    expect(r.ok).toBe(false); // spadek poniżej minimum Stripe
  });
  it("odrzuca nieaktywny", () => {
    expect(validateCoupon({ ...base, isActive: false }, 10000, 0, now).ok).toBe(false);
  });
  it("odrzuca wygasły", () => {
    expect(validateCoupon({ ...base, expiresAt: new Date("2026-05-01") }, 10000, 0, now).ok).toBe(false);
  });
  it("odrzuca wyczerpany limit użyć", () => {
    expect(validateCoupon({ ...base, maxUses: 5, usedCount: 5 }, 10000, 0, now).ok).toBe(false);
  });
  it("odrzuca zamówienie poniżej minimalnej kwoty", () => {
    expect(validateCoupon({ ...base, minOrderAmount: 20000 }, 10000, 0, now).ok).toBe(false);
  });
  it("odrzuca rabat, po którym razem z dostawą zostaje mniej niż 2,00 zł", () => {
    const r = validateCoupon({ ...base, type: "fixed", value: 9900 }, 10000, 0, now);
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Uruchom** – FAIL.

- [ ] **Step 3: `coupons.ts`**

```ts
export const MIN_STRIPE_TOTAL = 200; // 2,00 zł w groszach

export type CouponRow = {
  type: "percent" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
};

export function normalizeCouponCode(s: string): string {
  return s.trim().toUpperCase();
}

export function validateCoupon(
  c: CouponRow,
  itemsTotal: number,
  shippingCost: number,
  now = new Date()
): { ok: true; discount: number } | { ok: false; reason: string } {
  if (!c.isActive) return { ok: false, reason: "Ten kod rabatowy jest nieaktywny." };
  if (c.expiresAt && c.expiresAt.getTime() < now.getTime())
    return { ok: false, reason: "Ten kod rabatowy wygasł." };
  if (c.maxUses !== null && c.usedCount >= c.maxUses)
    return { ok: false, reason: "Limit użyć tego kodu został wyczerpany." };
  if (itemsTotal < c.minOrderAmount)
    return { ok: false, reason: "Zamówienie jest zbyt małe, aby użyć tego kodu." };

  const raw = c.type === "percent" ? Math.floor((itemsTotal * c.value) / 100) : c.value;
  const discount = Math.min(raw, itemsTotal);
  if (itemsTotal - discount + shippingCost < MIN_STRIPE_TOTAL)
    return { ok: false, reason: "Rabat jest zbyt wysoki dla wartości tego zamówienia." };
  return { ok: true, discount };
}
```

- [ ] **Step 4: Uruchom testy** – PASS.

- [ ] **Step 5: Walidatory** – w `checkoutSchema` dodaj:

```ts
customerNotes: z.string().max(1000, "Maks. 1000 znaków").optional().default(""),
couponCode: z.string().max(40).optional().default(""),
acceptTerms: z.literal("on", { errorMap: () => ({ message: "Wymagana akceptacja regulaminu i polityki prywatności" }) }),
acceptCustomWaiver: z.literal("on", { errorMap: () => ({ message: "Wymagane potwierdzenie informacji o produktach na zamówienie" }) }),
```
(`formData.get(...)` dla checkboxów daje `"on"` lub `null`; zmapuj `null` → `undefined`). Dodaj `couponSchema` (`code` regex `^[A-Z0-9_-]{3,40}$` po normalizacji, `type` enum, `value` – percent 1–90, fixed ≥ 100, `minOrderAmount ≥ 0`, `maxUses` int ≥ 1 lub puste, `expiresAt` data lub puste).

- [ ] **Step 6: `checkout.ts`** – po wyliczeniu `itemsTotal`: jeśli `couponCode` niepusty → wczytaj kupon po `normalizeCouponCode`, `validateCoupon(...)`; przy błędzie zwróć `{ error: reason }`; zapisz w zamówieniu `couponCode`, `discountAmount`, `customerNotes`, `termsAcceptedAt = now`, `termsVersion = TERMS_VERSION` (z `src/lib/legal.ts`: `export const TERMS_VERSION = "2026-10-06";`), `customWaiverAcceptedAt = now`; `totalAmount = itemsTotal - discount + shippingCost`. W sesji Stripe dodaj `customer_email: session.user.email` i – przy rabacie – `discounts: [{ coupon: (await stripe.coupons.create({ amount_off: discount, currency: "pln", duration: "once", name: couponCode })).id }]`. Limit użyć liczony dopiero przy opłaceniu (webhook, Task 7 Step 7); kupon jest zawsze ponownie walidowany po stronie serwera.

- [ ] **Step 7: Formularz kasy** – dodaj: pole „Kod rabatowy" (zwykłe pole tekstowe, rabat liczony serwerowo; podsumowanie pokazuje komunikat „Rabat zostanie naliczony w następnym kroku" **albo** osobny przycisk „Zastosuj" wywołujący `previewCoupon(code, cartInput)` – wybierz wariant z przyciskiem i wspólnym helperem walidacji), textarea **„Uwagi do zamówienia (np. kolory, personalizacja, dedykacja)"** z licznikiem znaków (max 1000), informację „Czas realizacji i wysyłki: do 21 dni roboczych", dwa checkboxy z linkami do `/regulamin` i `/polityka-prywatnosci` (otwierane w nowej karcie) oraz przycisk **„Zamawiam z obowiązkiem zapłaty"**. Przycisk wyłączony, dopóki oba checkboxy niezaznaczone (egzekwowane też serwerowo).

- [ ] **Step 8: Panel kuponów** – `admin-coupons.ts` (role admin, walidacja `couponSchema`, normalizacja kodu, błąd przy duplikacie `code`), strona `/admin/kupony`: formularz tworzenia + tabela (kod, typ/wartość, użycia `used/max`, ważność, przełącznik aktywny/nieaktywny, usuń). Link „Kupony" w `admin-sidebar.tsx`.

- [ ] **Step 9: Weryfikacja** – `npm test` PASS; `npm run build` 0; ręcznie: kod `-10%`, kod wygasły, kod z limitem 1 (drugie użycie po opłaceniu odrzucone), kwota na Stripe = suma − rabat + dostawa; zamówienie bez checkboxów odrzucone (także przy ręcznym wywołaniu).

- [ ] **Step 10: Commit** – `git commit -m "feat(checkout): customer notes, coupons with admin panel, legal acceptance recorded"`

---

### Task 9: Strony prawne (regulamin, polityka prywatności) i zgody

**Files:**
- Create: `src/lib/legal.ts` (jeśli nie powstał w Task 8), `src/app/[locale]/regulamin/page.tsx`, `src/app/[locale]/polityka-prywatnosci/page.tsx`
- Modify: `src/components/layout/footer.tsx`, `src/middleware.ts` (bez zmian – strony publiczne), `messages/*.json` (etykiety linków)

**Interfaces:** Consumes: `getSettings()` (dane sprzedawcy), `TERMS_VERSION`.

- [ ] **Step 1: Regulamin (`/regulamin`)** – strona serwerowa, dane sprzedawcy z `getSettings()` (gdy puste – widoczny komunikat dla admina w panelu „Uzupełnij dane sprzedawcy w Ustawieniach"; strona publiczna wyświetla wtedy „[dane w trakcie uzupełniania]" – **uwaga:** przed uruchomieniem sprzedaży dane muszą być uzupełnione). Wymagane sekcje:
  1. Postanowienia ogólne i dane sprzedawcy (imię i nazwisko / firma, adres, e-mail, telefon, NIP jeśli jest).
  2. Definicje (Klient, Konsument, Produkt na zamówienie).
  3. Zasady składania zamówień (rejestracja, koszyk, kod rabatowy, uwagi do zamówienia, **zatwierdzenie zamówienia przez Sprzedawcę** – umowa zawarta z chwilą zatwierdzenia/e-maila; możliwość odmowy z pełnym zwrotem).
  4. Ceny (brutto, PLN), płatności (Stripe: karty, BLIK itd. wg konfiguracji), koszty dostawy (kurier 15 zł, Paczkomat 12 zł, odbiór 0 zł).
  5. **Realizacja i dostawa: do 21 dni roboczych** od zatwierdzenia/zaksięgowania płatności (do ustalenia w czacie z użytkowniczką), informacja o ewentualnych opóźnieniach i powiadomieniach e-mail.
  6. **Odstąpienie od umowy:** konsument ma 14 dni, **z wyjątkiem** produktów nieprefabrykowanych, wykonanych według specyfikacji konsumenta lub służących zaspokojeniu jego zindywidualizowanych potrzeb (art. 38 pkt 3 ustawy o prawach konsumenta) – w szczególności produktów personalizowanych; jasny opis, które produkty są wyłączone; **wzór formularza odstąpienia** w załączniku (dla produktów niewyłączonych).
  7. Reklamacje – rękojmia (2 lata dla towaru, art. 5561 i n. KC; obowiązuje także dla produktów na zamówienie), adres/e-mail reklamacyjny, termin odpowiedzi 14 dni.
  8. Pozasądowe rozwiązywanie sporów (informacja o możliwości skorzystania z mediacji/UOKiK, bez odwołania do wycofanej platformy ODR – zweryfikować aktualność przed publikacją).
  9. Dane osobowe (odesłanie do polityki prywatności), prawa autorskie do projektów i zdjęć, postanowienia końcowe, data wejścia w życie = `TERMS_VERSION`.

- [ ] **Step 2: Polityka prywatności (`/polityka-prywatnosci`)** – administrator danych (jak wyżej), zakres danych (konto, zamówienia, dostawa, wiadomości z formularza), cele i podstawy prawne (art. 6 ust. 1 lit. b, c, f RODO), odbiorcy (Stripe, Vercel, Neon, Google/Gmail – e-maile, firmy kurierskie), przekazywanie poza EOG (SCC/DPF dostawców), okres przechowywania (dane księgowe 5 lat, konto do usunięcia), prawa osoby (dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw, skarga do PUODO), pliki cookies/localStorage (wyłącznie niezbędne: sesja logowania, koszyk, język – brak banera zgody; **jeśli kiedykolwiek dodamy analitykę/marketing – wymagany baner**), zabezpieczenia (TLS, hasła hashowane bcrypt, szyfrowanie bazy at-rest).

- [ ] **Step 3: Stopka** – linki „Regulamin", „Polityka prywatności", dane kontaktowe i Instagram z `getSettings()`.

- [ ] **Step 4: Weryfikacja** – `npm run build` (0); strony renderują się dla `/pl/regulamin` i `/pl/polityka-prywatnosci`; linki z kasy otwierają je w nowej karcie. Na końcu pracy rekomendacja: przegląd treści przez prawnika/radcę przed uruchomieniem produkcyjnym (plan i teksty nie są poradą prawną).

- [ ] **Step 5: Commit** – `git commit -m "feat(legal): terms of service and privacy policy pages, footer links"`

---

### Task 10: Formularz kontaktowy → e-mail, ochrona przed spamem

**Files:**
- Modify: `src/actions/contact.ts`, `src/app/[locale]/kontakt/contact-client-form.tsx`, `src/app/[locale]/kontakt/page.tsx`, `src/lib/validators.ts`

**Interfaces:** Consumes: `sendMail` (Task 6), `getSettings()` (Task 3), `escapeHtml`. 

- [ ] **Step 1: `contact.ts`** – dodaj pole-pułapkę `website` (honeypot): niepuste → zwróć `{ success: true }` bez zapisu/e-maila. Po zapisie do `contactMessages`: `sendMail({ to: getSettings().contactEmail (domyślnie cosmic.loop.core+shoop@gmail.com), subject: "[Kontakt] " + subject, replyTo: parsed.data.email, html: <escapowany treść>, text })`. **Usuń** udawanie sukcesu przy błędzie bazy: błąd zapisu → `{ success: false, error: "Nie udało się wysłać wiadomości. Spróbuj ponownie." }`. Błąd e-maila nie przerywa (wiadomość jest zapisana w bazie) – loguj.
- [ ] **Step 2: Formularz** – ukryte pole `website` (`tabIndex={-1}`, `autoComplete="off"`, wyrenderowane poza ekranem, `aria-hidden`); strona kontaktu pokazuje dane z `getSettings()` (e-mail, telefon, link do Instagrama) zamiast na sztywno.
- [ ] **Step 3: Weryfikacja** – `npm run build`; po wdrożeniu wiadomość z formularza dociera na `cosmic.loop.core+shoop@gmail.com` z `Reply-To` klienta.
- [ ] **Step 4: Commit** – `git commit -m "feat(contact): email delivery of contact form, honeypot, dynamic contact details"`

---

### Task 11: Dokumentacja, końcowa weryfikacja i wdrożenie

**Files:** Modify: `PROJECT_CONTEXT.md`, `.env.example`

- [ ] **Step 1: Aktualizacja `PROJECT_CONTEXT.md`** – nowa nazwa, asortyment, przepływ zamówień, kupony, zmienne środowiskowe (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM`(opc.), `CONTACT_INBOX`(opc.)), lista tras admina, ostrzeżenie o niewpisywaniu sekretów do plików.
- [ ] **Step 2: Pełna weryfikacja lokalna**

```powershell
npm test
npm run build
```
Oczekiwane: wszystkie testy PASS, build kod 0.
- [ ] **Step 3: Zmienne na Vercel (użytkowniczka, instrukcja w czacie)** – `GMAIL_USER=cosmic.loop.core@gmail.com`, `GMAIL_APP_PASSWORD` (16-znakowe „Hasło aplikacji"), nowy `AUTH_SECRET`, zaktualizowane `DATABASE_URL`/`MIGRATION_DATABASE_URL` po zmianie hasła Neon.
- [ ] **Step 4: Migracje na produkcyjnej bazie** (ta sama baza Neon): Task 1 SQL, `rebrand-data.ts`, `set-admin.ts` – uruchomione już wcześniej w odpowiednich taskach.
- [ ] **Step 5: Push** (autor `Mati-bgl`): `git push origin main`; sprawdź w Vercel status **Ready**.
- [ ] **Step 6: Test akceptacyjny end-to-end (Stripe tryb testowy)** – lista kontrolna:
  1. Rejestracja nowego klienta (hasło ≥ 10 znaków) i zmiana hasła w `/konto`.
  2. Dodanie produktu w adminie, zamówienie z uwagami i kodem rabatowym, oba checkboxy, karta `4242…`.
  3. Admin dostaje e-mail; w `/admin/zamowienia` „Zatwierdź" → klient dostaje e-mail; „Wyślij informację o opóźnieniu" → e-mail; „Oznacz jako wysłane" z linkiem → e-mail.
  4. Odrzucenie testowego zamówienia → refund w Stripe Dashboard + e-mail.
  5. Edycja kontaktu/Instagrama w `/admin/ustawienia` widoczna w stopce i na `/kontakt`.
  6. Pasek „21 dni roboczych", brak informacji o stanach magazynowych.
- [ ] **Step 7: Commit i podsumowanie dla użytkowniczki.**

---

## Self-Review

**1. Pokrycie wymagań:** asortyment/nazwa/logo → T4; zmiana hasła + bezpieczeństwo/szyfrowanie → T0, T2; edycja kontaktu + Instagram → T3; 21 dni → T4 (+ regulamin T9, e-maile T6); e-maile opóźnienie/zatwierdzenie/wysyłka jednym kliknięciem → T6, T7; konto admina → T5; uwagi do zamówienia → T8; kontakt na +shoop → T10 (+ Reply-To w T6); usunięcie dostępności → T4; kupony → T8; wymogi prawne i zgody → T9 + T8 Step 7; audyt bezpieczeństwa → tabela S1–S9 + T0/T2/T7/T10. Brak luk.

**2. Placeholdery:** kroki UI opisują konkretne pliki, pola i zachowania; pełny kod podano dla całej logiki domenowej i testów. Pozostawione do ustalenia z użytkowniczką dane sprzedawcy (T3/T9) – to wejście, nie brak planu.

**3. Spójność typów:** `validateCoupon(c, itemsTotal, shippingCost, now?)` użyte spójnie w T8; `canTransition`/`STATUS_LABELS_PL` w T7 i konto; `sendMail` zwraca `{ ok, error? }` we wszystkich użyciach; `TERMS_VERSION` w `legal.ts` (T8 Step 6, T9).

**4. Review Focus:** pięć pozycji ma testy w T6, T7, T8.

## Poza zakresem (do osobnej decyzji)

- Reset hasła przez e-mail („Zapomniałem hasła") i weryfikacja adresu e-mail przy rejestracji – naturalne następne kroki, skoro e-maile będą działać.
- Pełny CSP, 2FA dla admina, faktury/paragony (zależne od formy działalności), baner cookies (potrzebny dopiero przy analityce/marketingu), tłumaczenie stron prawnych na EN.
- Stripe w trybie produkcyjnym (wymaga aktywacji konta Stripe z danymi sprzedawcy).
