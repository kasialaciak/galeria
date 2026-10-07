# 🧠 PROJECT_CONTEXT.md – Pamięć i Pełne Podsumowanie Projektu

> **Cel pliku:** Niniejszy dokument stanowi skondensowaną pamięć projektu sklepu internetowego. Każdy asystent AI lub programista po przeczytaniu tego pliku ma natychmiastowy, pełny kontekst architektury, bazy danych, wdrożenia oraz historii rozwiązanych problemów.

---

## 1. Informacje Ogólne o Projekcie
- **Nazwa projektu:** Sklep internetowy "Cosmic Loop" (wcześniej "Rękodzieło").
- **Asortyment:** Rękodzieło tworzone na zamówienie (szydełko m.in. pluszaki, breloczki, torebki; biżuteria z gliny/modeliny; ceramika).
- **Czas realizacji:** Do 21 dni roboczych (wszystko robione po złożeniu zamówienia).
- **Repozytorium GitHub:** `https://github.com/Mati-bgl/stronawww`
- **Właściciel / Autor commitów:** `Mati-bgl` (`matylda.bgl@gmail.com`)
- **Hosting i wdrożenie:** Vercel (automatyczny CI/CD z gałęzi `main`).
- **Języki strony:** Dwujęzyczność (PL / EN) obsługiwana przez `next-intl`.
- **E-maile (SMTP):** Sklep wysyła automatyczne powiadomienia do klientów z adresu GMail zdefiniowanego w `.env.local` (`GMAIL_USER` / `GMAIL_APP_PASSWORD`). 

---

## 2. Stack Technologiczny
- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack).
- **Styling:** Tailwind CSS v4 + komponenty UI (Radix UI / shadcn/ui).
- **Baza danych:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
- **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
- **Autoryzacja:** Auth.js v5 (`next-auth@5.0.0-beta`, JWT session, bcryptjs).
- **Płatności:** Stripe Checkout Session + Webhook (`checkout.session.completed`).
- **Zarządzanie stanem klienta:** Zustand (koszyk z `persist` w localStorage).

---

## 3. Konta i Uprawnienia
- **Konto Administratora:**
  - **Email:** `cosmic.loop.core@gmail.com`
  - **Rola w bazie:** `role: "admin"`
  - **Panel administracyjny:** dostępny pod adresem `/admin`. Umożliwia zarządzanie asortymentem (bez zliczania stanu magazynowego, bo "na zamówienie"), kategoriami, zamówieniami (zmiana statusów wysyła e-maile!), zarządzanie zniżkami/kuponami oraz ustawieniami sklepu (dane kontaktowe, link do Instagrama np. `cosmic_loop.craft`).
- **Konta klientów:**
  - Rejestracja pod `/konto/rejestracja`.
  - Logowanie pod `/konto/logowanie`.
  - Profil klienta, możliwość zmiany hasła, przegląd historii.

---

## 4. Baza Danych (Neon PostgreSQL)
1. `users` – użytkownicy i administratorzy.
2. `accounts`, `sessions`, `verification_tokens` – tabele Auth.js.
3. `categories` – kategorie główne (Szydełko, Biżuteria z modeliny, Ceramika) i podkategorie.
4. `products` – produkty (cena w groszach, slug, warianty). Zlikwidowano pojęcie stanu magazynowego (`stock`).
5. `product_images` – galeria zdjęć produktów powiązana relacją.
6. `orders` – zamówienia z danymi, notatkami klienta (`customerNotes`), e-mailami.
7. `order_items` – pozycje w zamówieniu.
8. `coupons` – kupony rabatowe definiowane w panelu administratora.
9. `wishlists` – lista życzeń zalogowanych użytkowników.
10. `homepage_content` – slajdy karuzeli i edytowalna sekcja „O nas”.
11. `contact_messages` – wiadomości z formularza kontaktowego. Z panelu admina ustawiany jest email na który formularz wysyła pytania (`cosmic.loop.core+shoop@gmail.com`).

---

## 5. Integracja ze Stripe (Płatności)
- **Kalkulacja cen:** 
  - Dynamicznie sprawdzana z Neon DB dla bezpieczeństwa.
  - Odejmuje wartość użytego zniżkowego **Kuponu** rabatowego wpisanego w Checkout form.
- **Webhook Stripe:** 
  - Endpoint: `https://[domena-vercel]/api/webhooks/stripe`
  - Event `checkout.session.completed` nadaje zamówieniu status "paid".

---

## 6. Wymogi prawne i Checkout
- Koszyk uzupełniony o **obowiązkowy checkbox akceptacji regulaminu**.
- Nowy regulamin precyzujący brak prawa zwrotu z uwagi na **Rękodzieło personalizowane i robione pod wymiar** (zgodnie z przepisami).
- Checkout posiada przycisk prawnie wymagany **"Zamawiam z obowiązkiem zapłaty"**.

---

## 7. Zmienne Środowiskowe (Environment Variables)
Wymagane w pliku `.env.local` na komputerze oraz w **Settings -> Environment Variables** na Vercel:
- `DATABASE_URL` – connection string Neon (pooler).
- `AUTH_SECRET` – klucz szyfrowania sesji.
- `AUTH_TRUST_HOST` – `true`.
- `NEXT_PUBLIC_APP_URL` – URL produkcyjny strony.
- `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` – Do działania wysyłki powiadomień do klientów!

---

## 8. Kluczowe Rozwiązania i Rozwiązane Problemy (Lessons Learned)
1. **Blokowanie deployu przez Vercel (Status: Blocked):**
   - *Przyczyna:* Commity pochodziły z innego konta Git niż właściciel Vercela (`matyldabgl-8726`).
   - *Rozwiązanie:* Lokalny Git został na stałe skonfigurowany pod `Mati-bgl` (`matylda.bgl@gmail.com`). Wszelkie commity muszą mieć tego autora.
2. **Cudzysłowy w DATABASE_URL na Vercel:**
   - W pliku `src/db/index.ts` dodano funkcję `sanitizeDatabaseUrl()`, która automatycznie oczyszcza link z cudzysłowów.
3. **PowerShell `replace` quirks (Poważny problem z uszkadzaniem plików):**
   - Agent PowerShell miał problem ze znakiem nowej linii w TypeScript podczas aktualizacji poprzez `Get-Content ... -replace`. Zamiast modyfikować z poziomu skryptu powłoki, w plikach TS/TSX lepiej korzystać bezpośrednio z `write_to_file` i pełnego overwrite.

---

## 9. Jak zacząć w nowym czacie:
Wystarczy wpisać asystentowi:
> *"Cześć! Kontynuujemy prace nad projektem sklepu Cosmic Loop. Przeczytaj plik `PROJECT_CONTEXT.md` i powiedz, w czym możesz pomóc."*

4. **Usuwanie danych (Foreign Keys)**:
   - *Problem:* Błędy Drizzle ORM przy kasowaniu produktów.
   - *Rozwiązanie:* Zawsze najpierw kasować tabele podrzędne (np. order_items, orders), a dopiero potem products.

5. **Node.js Path w skryptach systemowych**:
   - *Problem:* Brak komend 
pm/
px w tle powłoki.
   - *Rozwiązanie:* Zawsze prefiksować $env:PATH += ";C:\Program Files\nodejs";" przy wywołaniach npx/npm.
