# Specyfikacja Projektu: Sklep Internetowy z Rękodziełem

> **Status:** Do weryfikacji przez klienta
> **Data:** 2026-09-24
> **Wersja:** 1.0

---

## 1. Cel projektu

Stworzenie sklepu internetowego do sprzedaży rękodzieła — z pełnym procesem
zakupowym (przeglądanie → koszyk → płatność Stripe), systemem kont
użytkowników, listą życzeń oraz panelem administracyjnym do zarządzania
produktami, kategoriami, treścią strony głównej i zamówieniami.

Sklep będzie prowadzony przez jedną osobę (administratora). Strona jest
dwujęzyczna (PL jako domyślny, EN jako opcjonalny).

---

## 2. Stos technologiczny

| Warstwa | Technologia | Uzasadnienie |
|:---|:---|:---|
| Framework | Next.js 15 (App Router, React 19) | Natywna integracja z Vercel, Server Components, Server Actions |
| Język | TypeScript | Bezpieczeństwo typów w całym projekcie |
| Baza danych | PostgreSQL na Neon (serverless) | Darmowy tier, zero utrzymania serwera |
| ORM | Drizzle ORM (driver: neon-http) | Lekki, TypeScript-first, idealny dla serverless |
| Autoryzacja | Auth.js v5 (NextAuth) — Credentials | JWT, split-config (edge + node) |
| Płatności | Stripe Checkout | Sandbox na start, potem produkcja |
| UI | Tailwind CSS + shadcn/ui | Kopiowane komponenty — zero lock-in |
| Upload zdjęć | UploadThing | Darmowy, natywna integracja z Next.js |
| i18n | next-intl | Najlepsza biblioteka i18n dla App Router |
| Stan koszyka | Zustand + localStorage | Persystentny koszyk bez obciążania bazy |
| Walidacja | Zod | Walidacja formularzy i Server Actions |
| Hosting | Vercel | Auto-deploy z GitHub |
| Repozytorium | GitHub: Mati-bgl/stronawww | Prywatne repo |

---

## 3. Schemat bazy danych

### 3.1 Tabele autoryzacji (Auth.js adapter)

**users**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| name | text | |
| email | text | UNIQUE, NOT NULL |
| emailVerified | timestamp | |
| password | text | hashowane bcryptjs |
| role | text | DEFAULT 'user', wartości: 'user' / 'admin' |
| phone | text | opcjonalne |
| createdAt | timestamp | DEFAULT now() |
| updatedAt | timestamp | DEFAULT now() |

**accounts** — dla Auth.js adaptera
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| userId | text | FK → users.id, ON DELETE CASCADE |
| type | text | NOT NULL |
| provider | text | NOT NULL |
| providerAccountId | text | NOT NULL |
| | | PK: (provider, providerAccountId) |

**sessions**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| sessionToken | text | PK |
| userId | text | FK → users.id, ON DELETE CASCADE |
| expires | timestamp | NOT NULL |

**verification_tokens**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| identifier | text | NOT NULL |
| token | text | NOT NULL |
| expires | timestamp | NOT NULL |
| | | PK: (identifier, token) |

### 3.2 Tabele produktowe

**categories**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| namePl | text | NOT NULL |
| nameEn | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| parentId | text | FK → categories.id, nullable (podkategorie) |
| image | text | URL, nullable |
| sortOrder | integer | DEFAULT 0 |
| createdAt | timestamp | DEFAULT now() |

**products**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| namePl | text | NOT NULL |
| nameEn | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| descriptionPl | text | |
| descriptionEn | text | |
| price | integer | NOT NULL, w groszach (100 = 1 PLN) |
| compareAtPrice | integer | nullable, do pokazania "było X, teraz Y" |
| categoryId | text | FK → categories.id |
| parentProductId | text | FK → products.id, nullable (warianty) |
| variantLabelPl | text | nullable, np. "Rozmiar: L" |
| variantLabelEn | text | nullable, np. "Size: L" |
| stock | integer | DEFAULT 0 |
| isPublished | boolean | DEFAULT false |
| isFeatured | boolean | DEFAULT false, "Proponowane produkty" |
| viewCount | integer | DEFAULT 0 |
| addToCartCount | integer | DEFAULT 0 |
| addToWishlistCount | integer | DEFAULT 0 |
| createdAt | timestamp | DEFAULT now() |
| updatedAt | timestamp | DEFAULT now() |

> **Warianty:** Każdy wariant jest osobnym wierszem w tabeli `products`
> z ustawionym `parentProductId`. Produkt nadrzędny wyświetla wszystkie
> swoje warianty na karcie produktu. Wariant ma własną cenę, zdjęcia
> i stan magazynowy.

**product_images**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| productId | text | FK → products.id, ON DELETE CASCADE |
| url | text | NOT NULL |
| alt | text | |
| sortOrder | integer | DEFAULT 0 |

### 3.3 Tabele zamówieniowe

**orders**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| orderNumber | text | UNIQUE, czytelny numer np. "ZAM-2026-0001" |
| userId | text | FK → users.id |
| status | text | 'pending' / 'paid' / 'shipped' / 'delivered' / 'cancelled' |
| totalAmount | integer | w groszach |
| shippingName | text | |
| shippingAddress | text | |
| shippingCity | text | |
| shippingPostalCode | text | |
| shippingCountry | text | DEFAULT 'PL' |
| shippingMethod | text | np. 'kurier', 'paczkomat', 'odbiór osobisty' |
| shippingCost | integer | w groszach |
| stripeSessionId | text | |
| stripePaymentIntentId | text | |
| createdAt | timestamp | DEFAULT now() |
| updatedAt | timestamp | DEFAULT now() |

**order_items**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| orderId | text | FK → orders.id, ON DELETE CASCADE |
| productId | text | FK → products.id |
| productName | text | snapshot nazwy w momencie zakupu |
| quantity | integer | NOT NULL |
| unitPrice | integer | w groszach, snapshot ceny |
| variantLabel | text | nullable |

### 3.4 Lista życzeń

**wishlists**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| userId | text | FK → users.id, ON DELETE CASCADE |
| productId | text | FK → products.id, ON DELETE CASCADE |
| createdAt | timestamp | DEFAULT now() |
| | | UNIQUE: (userId, productId) |

### 3.5 Treść strony głównej (edytowalna z panelu admina)

**homepage_content**
| Kolumna | Typ | Ograniczenia |
|:---|:---|:---|
| id | text | PK, UUID |
| section | text | 'carousel' / 'about' |
| titlePl | text | |
| titleEn | text | |
| descriptionPl | text | |
| descriptionEn | text | |
| imageUrl | text | |
| linkUrl | text | nullable, link z karuzeli |
| sortOrder | integer | DEFAULT 0 |
| isActive | boolean | DEFAULT true |

---

## 4. Autoryzacja i uprawnienia

### 4.1 Rejestracja i logowanie
- Rejestracja: email + hasło (hashowane bcryptjs, min. 8 znaków)
- Logowanie: Auth.js Credentials provider → JWT
- Strategia sesji: JWT (wymagana przez Credentials provider)

### 4.2 Split-config pattern (Auth.js v5)
- `auth.config.ts` — edge-safe (callbacks, pages), importowany w middleware
- `auth.ts` — node-safe (Drizzle adapter, Credentials provider, bcrypt)

### 4.3 Role i chronione ścieżki
| Ścieżka | Wymagania |
|:---|:---|
| `/` `/produkty` `/kontakt` | Publiczne |
| `/konto/*` | Zalogowany użytkownik |
| `/lista-zyczen` | Zalogowany użytkownik |
| `/zamowienie` | Zalogowany użytkownik |
| `/admin/*` | Zalogowany użytkownik z `role: 'admin'` |

### 4.4 Middleware
Jeden plik `middleware.ts` obsługuje kolejno:
1. next-intl — detekcja języka, rewrite URL-i
2. Auth.js — ochrona tras wymagających logowania
3. Admin guard — przekierowanie nie-adminów z `/admin`

---

## 5. Architektura frontendu

### 5.1 Nawigacja górna (sticky, zawsze widoczna)

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]  [☰]                          [♡] [🛒 2] [👤] PL│EN│
└─────────────────────────────────────────────────────────────┘
```

- **Lewa strona:** Logo sklepu + ikona hamburgera (☰)
- **Hamburger:** Otwiera Sheet (wysuwany panel z lewej) z linkami:
  - Strona Główna
  - Produkty
  - Kontakt
- **Prawa strona:** 3 ikony:
  - Serce (♡) → `/lista-zyczen`
  - Koszyk (🛒) z badge'em ilości → otwiera Cart Drawer (wysuwany z prawej)
  - Profil (👤) → `/konto` (lub `/konto/logowanie` jeśli niezalogowany)
- **Przełącznik języka:** PL | EN

### 5.2 Strona główna (`/`)

```
┌─────────────────────────────────────────┐
│          KARUZELA ZDJĘĆ                 │
│    (auto-przesuwanie co 5 sekund)       │
│    (jedno zdjęcie na raz)               │
│    (zarządzana z panelu admina)         │
├─────────────────────────────────────────┤
│                                         │
│       "Proponowane produkty"            │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │ Pro │  │ Pro │  │ Pro │  │ Pro │   │
│  │ dukt│  │ dukt│  │ dukt│  │ dukt│   │
│  │  1  │  │  2  │  │  3  │  │  4  │   │
│  └─────┘  └─────┘  └─────┘  └─────┘   │
│                                         │
│  (bestsellery + nowo dodane)            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────────────┐     │
│  │ ZDJĘCIE  │  │  OPIS SKLEPU     │     │
│  │          │  │  (edytowalny     │     │
│  │          │  │   z admina)      │     │
│  └──────────┘  └──────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### 5.3 Produkty (`/produkty`)

**Widok początkowy:** Siatka kategorii i podkategorii (kafelki ze zdjęciem
i nazwą). Kliknięcie w kategorię filtruje produkty.

**Widok przefiltrowany:**
- Pasek wyszukiwania (szukanie po nazwie i opisie)
- Filtry: kategoria, zakres cen, sortowanie (najnowsze, cena ↑, cena ↓, popularność)
- Siatka kart produktów

**Karta produktu (w siatce):**
- Zdjęcie główne
- Nazwa
- Krótki opis (ucięty do 2 linii)
- Cena (jeśli compareAtPrice — przekreślona stara cena)
- Przycisk „Dodaj do koszyka"
- Ikona serca (dodaj do listy życzeń)

### 5.4 Szczegóły produktu (`/produkty/[slug]`)

- Galeria zdjęć: duże zdjęcie + miniaturki pod spodem
- Nazwa, pełny opis, cena
- Jeśli produkt ma warianty — selektor wariantów (przyciski/dropdown)
- Przycisk „Dodaj do koszyka"
- Przycisk „Dodaj do listy życzeń"
- Przy wejściu na stronę: `viewCount++` w bazie (Server Action)

### 5.5 Koszyk

**Cart Drawer (Sheet)** — otwiera się z prawej strony po kliknięciu ikony
koszyka lub po dodaniu produktu:
- Lista produktów (miniaturka, nazwa, wariant, cena, ilość)
- Suma
- Przycisk „Przejdź do koszyka" → `/koszyk`

**Strona koszyka (`/koszyk`):**
- Pełna lista produktów z możliwością zmiany ilości i usunięcia
- Podsumowanie: suma produktów
- Przycisk „Zamów" → `/zamowienie` (wymaga zalogowania)

### 5.6 Finalizacja zakupu (`/zamowienie`)

Wymaga zalogowania (redirect do logowania jeśli nie).

1. **Formularz danych do wysyłki:**
   - Imię i nazwisko
   - Adres
   - Miasto
   - Kod pocztowy
   - Kraj (domyślnie Polska)

2. **Wybór metody wysyłki:**
   - Kurier
   - Paczkomat
   - Odbiór osobisty
   - (metody zarządzane przez admina — na start hardcoded)

3. **Podsumowanie zamówienia:**
   - Lista produktów
   - Koszt wysyłki
   - Suma

4. **Przycisk „Zapłać":**
   - Tworzy zamówienie w bazie (status: `pending`)
   - Tworzy Stripe Checkout Session
   - Przekierowuje na stronę Stripe

5. **Po płatności:**
   - Sukces → `/zamowienie/sukces`
   - Anulowanie → powrót do koszyka
   - Webhook Stripe → aktualizuje status na `paid`

### 5.7 Lista życzeń (`/lista-zyczen`)

- Wymaga zalogowania
- Siatka zapisanych produktów
- Przyciski: „Usuń z listy" / „Dodaj do koszyka"

### 5.8 Konto (`/konto`)

- Dane użytkownika (imię, email, telefon) — edytowalne
- Historia zamówień (numer, data, status, kwota, link do szczegółów)
- Przycisk „Wyloguj się"

### 5.9 Kontakt (`/kontakt`)

- Informacje kontaktowe (adres, email, telefon)
- Formularz kontaktowy (imię, email, temat, wiadomość)
- Wiadomość z formularza zapisywana w bazie lub wysyłana emailem

---

## 6. Panel administracyjny (`/admin`)

Ukryty z poziomu publicznej nawigacji. Własny layout z bocznym menu.
Dostępny wyłącznie dla użytkownika z `role: 'admin'`.

### 6.1 Sidebar nawigacji admina
- Dashboard (statystyki)
- Produkty (lista / dodaj / edytuj)
- Kategorie (zarządzanie drzewem kategorii)
- Zamówienia (lista / szczegóły / zmiana statusu)
- Strona główna (karuzela / sekcja "O nas")
- Ustawienia

### 6.2 Dashboard — statystyki
| Metryka | Źródło |
|:---|:---|
| Łączna liczba wyświetleń produktów | SUM(products.viewCount) |
| Dodania do koszyka | SUM(products.addToCartCount) |
| Dodania do listy życzeń | SUM(products.addToWishlistCount) |
| Liczba zamówień | COUNT(orders) |
| Przychód | SUM(orders.totalAmount) WHERE status = 'paid' |

Wyświetlane jako karty z ikonami + lista ostatnich zamówień.

### 6.3 Zarządzanie produktami
- Tabela produktów z wyszukiwaniem i filtrowaniem
- Formularz dodawania/edycji:
  - Nazwa (PL i EN)
  - Opis (PL i EN)
  - Cena w PLN (przeliczana na grosze przy zapisie)
  - Kategoria (dropdown)
  - Stan magazynowy
  - Zdjęcia (upload przez UploadThing, drag & drop reorder)
  - Czy opublikowany (toggle)
  - Czy proponowany/wyróżniony (toggle)
- Zarządzanie wariantami: tworzenie wariantów powiązanych z produktem nadrzędnym

### 6.4 Zarządzanie kategoriami
- Lista kategorii i podkategorii (drzewo)
- Formularz: nazwa (PL/EN), slug (auto-generowany), kategoria nadrzędna, zdjęcie
- Zmiana kolejności sortowania

### 6.5 Zarządzanie zamówieniami
- Lista zamówień z filtrami statusu
- Szczegóły zamówienia: produkty, dane wysyłki, dane płatności
- Zmiana statusu (pending → paid → shipped → delivered)

### 6.6 Zarządzanie treścią strony głównej
- Karuzela: dodawanie/usuwanie/zmiana kolejności slajdów (zdjęcie + opcjonalny link)
- Sekcja "O nas": edycja zdjęcia i tekstu (PL/EN)

---

## 7. Przepływ płatności (Stripe)

```
Użytkownik klika „Zapłać"
        │
        ▼
Server Action: createCheckoutSession()
  1. Walidacja danych formularza (Zod)
  2. Weryfikacja sesji użytkownika (auth())
  3. Pobranie produktów z bazy (weryfikacja cen i dostępności)
  4. Zapis zamówienia w bazie (status: 'pending')
  5. Wywołanie stripe.checkout.sessions.create({
       line_items: [...],         // dynamiczne price_data
       mode: 'payment',
       currency: 'pln',
       metadata: { orderId },
       success_url: /zamowienie/sukces?session_id={CHECKOUT_SESSION_ID},
       cancel_url: /koszyk
     })
  6. Zwrot session.url → redirect na Stripe
        │
        ▼
Stripe hosted checkout (użytkownik płaci)
        │
        ├─ Sukces ──► redirect do /zamowienie/sukces
        │                 + Stripe webhook ──► POST /api/webhooks/stripe
        │                     event: checkout.session.completed
        │                     → aktualizacja orders.status = 'paid'
        │                     → czyszczenie koszyka (client-side)
        │
        └─ Anulowanie ──► redirect do /koszyk
```

**Ważne:**
- Ceny ZAWSZE weryfikowane server-side (nigdy nie ufamy klientowi)
- Webhook podpisany kluczem Stripe (weryfikacja `stripe-signature`)
- Webhook czyta body jako `req.text()` (nie `req.json()`) — wymóg Next.js App Router
- Na start: Stripe Sandbox (klucze testowe)

---

## 8. Internacjonalizacja (PL/EN)

### 8.1 Konfiguracja next-intl
- Routing: `[locale]` segment w URL (`/en/produkty`, domyślny PL bez prefiksu)
- `localePrefix: 'as-needed'` — strona polska bez `/pl`, angielska z `/en`
- Domyślny: `pl`

### 8.2 Struktura tłumaczeń
```
messages/
├── pl.json    # Wszystkie teksty interfejsu po polsku
└── en.json    # Wszystkie teksty interfejsu po angielsku
```

### 8.3 Treść produktów
- Każdy produkt i kategoria ma kolumny `_pl` i `_en` w bazie danych
- Komponenty wybierają odpowiednią kolumnę na podstawie aktualnego locale

### 8.4 Przełącznik języka
- Widoczny w pasku nawigacji (PL | EN)
- Kliknięcie zmienia locale bez przeładowania strony (client-side navigation)

---

## 9. System designu — kolorystyka i typografia

### 9.1 Paleta kolorów

| Nazwa | Hex | Użycie |
|:---|:---|:---|
| Cream (tło) | `#FAF7F2` | Główne tło strony |
| White (karty) | `#FFFFFF` | Karty produktów, formularze, modalne |
| Charcoal (tekst) | `#2D2A26` | Tekst główny — cieplejszy niż czysty czarny |
| Forest Green (akcent) | `#1B4D3E` | Przyciski, linki, nagłówki, nawigacja |
| Teal (akcent 2) | `#3D8B7A` | Akcje drugorzędne, badge kategorie, hover |
| Warm Clay | `#C4704A` | Oszczędnie: badge wyprzedaży, ikona serca |
| Warm Gray (border) | `#E8E2DA` | Obramowania, separatory |
| Light Sage | `#E8F0EC` | Tło hover na elementach menu, tagi |

### 9.2 Typografia

| Rola | Font | Uzasadnienie |
|:---|:---|:---|
| Nagłówki, nazwy produktów | Playfair Display (serif) | Elegancja, rzemieślniczy charakter |
| Tekst, interfejs, przyciski | Inter (sans-serif) | Czytelność, nowoczesność |

- Oba z Google Fonts (darmowe, szybkie)
- Skala typograficzna: 14px (body), 16px (lead), 20/24/30/36px (nagłówki)
- Długość linii tekstu: max 75 znaków (czytelność)

### 9.3 Zasady designu
- **Jedno odważne miejsce:** Karuzela na stronie głównej jest elementem
  przyciągającym wzrok. Reszta strony jest spokojna i zdyscyplinowana.
- **Duże zdjęcia:** Rękodzieło kupuje się oczami — zdjęcia są
  eksponowane, interfejs im nie przeszkadza.
- **Minimalna animacja:** Tylko celowe przejścia (otwarcie koszyka,
  dodanie do koszyka — toast). Bez fade-in na scrollu.
- **Sentence case:** Nagłówki pisane normalnie (nie CAPS LOCK).
- **Wyrównanie do lewej:** Tekst i karty wyrównane do lewej (naturalne
  dla polskiego i angielskiego), nagłówki sekcji wycentrowane.

---

## 10. Struktura plików projektu

```
strona-www/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx              # Root locale layout (HTML, fonts, providers)
│   │   │   ├── page.tsx                # Strona główna
│   │   │   ├── produkty/
│   │   │   │   ├── page.tsx            # Lista kategorii + produkty
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        # Karta produktu
│   │   │   ├── koszyk/
│   │   │   │   └── page.tsx            # Pełna strona koszyka
│   │   │   ├── lista-zyczen/
│   │   │   │   └── page.tsx            # Lista życzeń (chroniona)
│   │   │   ├── zamowienie/
│   │   │   │   ├── page.tsx            # Checkout (chroniony)
│   │   │   │   └── sukces/
│   │   │   │       └── page.tsx        # Sukces po płatności
│   │   │   ├── konto/
│   │   │   │   ├── page.tsx            # Profil + historia zamówień
│   │   │   │   ├── logowanie/
│   │   │   │   │   └── page.tsx        # Login
│   │   │   │   └── rejestracja/
│   │   │   │       └── page.tsx        # Rejestracja
│   │   │   ├── kontakt/
│   │   │   │   └── page.tsx            # Kontakt
│   │   │   └── admin/
│   │   │       ├── layout.tsx          # Admin layout + sidebar
│   │   │       ├── page.tsx            # Dashboard (statystyki)
│   │   │       ├── produkty/
│   │   │       │   ├── page.tsx        # Lista produktów
│   │   │       │   ├── nowy/
│   │   │       │   │   └── page.tsx    # Dodaj produkt
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx    # Edytuj produkt
│   │   │       ├── kategorie/
│   │   │       │   └── page.tsx        # Zarządzanie kategoriami
│   │   │       ├── zamowienia/
│   │   │       │   ├── page.tsx        # Lista zamówień
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx    # Szczegóły zamówienia
│   │   │       └── strona-glowna/
│   │   │           └── page.tsx        # Edycja karuzeli i sekcji "O nas"
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts           # Auth.js route handlers
│   │   │   ├── uploadthing/
│   │   │   │   ├── core.ts            # Definicja file router
│   │   │   │   └── route.ts           # Upload route handlers
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts       # Stripe webhook
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ui/                         # shadcn/ui (Button, Card, Sheet, Dialog, Form...)
│   │   ├── layout/
│   │   │   ├── header.tsx              # Górny pasek nawigacji
│   │   │   ├── mobile-menu.tsx         # Wysuwane menu hamburgerowe
│   │   │   ├── cart-drawer.tsx         # Wysuwany koszyk (Sheet z prawej)
│   │   │   ├── footer.tsx              # Stopka
│   │   │   └── locale-switcher.tsx     # Przełącznik PL/EN
│   │   ├── products/
│   │   │   ├── product-card.tsx        # Karta produktu w siatce
│   │   │   ├── product-gallery.tsx     # Galeria zdjęć na stronie produktu
│   │   │   ├── product-filters.tsx     # Filtry i wyszukiwarka
│   │   │   ├── variant-selector.tsx    # Selektor wariantów
│   │   │   └── category-grid.tsx       # Siatka kategorii
│   │   ├── cart/
│   │   │   ├── cart-item.tsx           # Wiersz produktu w koszyku
│   │   │   └── cart-summary.tsx        # Podsumowanie koszyka
│   │   ├── checkout/
│   │   │   ├── checkout-form.tsx       # Formularz danych wysyłki
│   │   │   └── shipping-method.tsx     # Wybór metody wysyłki
│   │   ├── home/
│   │   │   ├── hero-carousel.tsx       # Karuzela zdjęć
│   │   │   ├── featured-products.tsx   # Proponowane produkty
│   │   │   └── about-section.tsx       # Sekcja zdjęcie + opis
│   │   └── admin/
│   │       ├── admin-sidebar.tsx       # Boczna nawigacja admina
│   │       ├── stats-cards.tsx         # Karty statystyk
│   │       ├── product-form.tsx        # Formularz produktu
│   │       ├── category-form.tsx       # Formularz kategorii
│   │       ├── order-table.tsx         # Tabela zamówień
│   │       ├── carousel-manager.tsx    # Zarządzanie karuzelą
│   │       └── image-upload.tsx        # Komponent uploadu zdjęć
│   ├── db/
│   │   ├── index.ts                    # Drizzle client (neon-http)
│   │   └── schema.ts                   # Wszystkie tabele i relacje
│   ├── lib/
│   │   ├── stripe.ts                   # Stripe client initialization
│   │   ├── utils.ts                    # Helper functions (cn, formatPrice)
│   │   └── validators.ts              # Zod schemas (product, order, user)
│   ├── hooks/
│   │   ├── use-cart.ts                 # Zustand store + localStorage
│   │   └── use-wishlist.ts             # Wishlist helpers
│   ├── actions/
│   │   ├── auth.ts                     # Login, register, logout
│   │   ├── products.ts                 # CRUD produktów
│   │   ├── categories.ts              # CRUD kategorii
│   │   ├── orders.ts                   # Zarządzanie zamówieniami
│   │   ├── checkout.ts                 # Tworzenie zamówienia + Stripe session
│   │   ├── wishlist.ts                 # Dodaj/usuń z listy życzeń
│   │   ├── homepage.ts                 # Edycja treści strony głównej
│   │   └── stats.ts                    # Pobranie statystyk admina
│   ├── i18n/
│   │   ├── routing.ts                  # next-intl: locales, defaultLocale
│   │   └── request.ts                  # next-intl: getRequestConfig
│   ├── middleware.ts                    # i18n + auth + admin guard
│   ├── auth.ts                         # Auth.js pełna konfiguracja (node)
│   └── auth.config.ts                  # Auth.js edge-safe config
├── messages/
│   ├── pl.json                         # Tłumaczenia polskie
│   └── en.json                         # Tłumaczenia angielskie
├── drizzle/                            # Wygenerowane migracje SQL
├── public/
│   └── images/                         # Statyczne assety (logo, ikony)
├── docs/
│   └── specs/
│       └── 2026-09-24-sklep-rekodzielo-design.md   # Ten dokument
├── drizzle.config.ts                   # Konfiguracja Drizzle Kit
├── next.config.ts                      # Konfiguracja Next.js + next-intl plugin
├── tailwind.config.ts                  # Tailwind + custom colors/fonts
├── components.json                     # shadcn/ui config
├── tsconfig.json
├── package.json
├── .env.local                          # Zmienne środowiskowe (nie commitować!)
├── .env.example                        # Szablon zmiennych (commitowany)
├── .gitignore
└── README.md
```

---

## 11. Zmienne środowiskowe

```env
# Baza danych (Neon)
DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require
MIGRATION_DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require

# Auth.js
AUTH_SECRET=wygenerowany-losowy-klucz
AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Wdrożenie i infrastruktura

### 12.1 Workflow
1. Rozwój lokalny → commit → push do GitHub (branch `main`)
2. Vercel auto-deploy z GitHub
3. Preview deploys na pull requestach

### 12.2 Podłączenie usług
- **Neon → Vercel:** Integracja Neon w panelu Vercel (automatyczne `DATABASE_URL`)
- **Stripe:** Klucze testowe w `.env` → klucze produkcyjne w Vercel env vars
- **UploadThing:** Token w Vercel env vars
- **GitHub:** https://github.com/Mati-bgl/stronawww

### 12.3 Migracje bazy danych
- Lokalna zmiana schematu w `src/db/schema.ts`
- `npx drizzle-kit generate` → wygenerowanie SQL migracji
- `npx drizzle-kit migrate` → zastosowanie migracji na Neon
- Migracje commitowane do repo (folder `drizzle/`)

---

## 13. Ograniczenia i decyzje świadome

1. **Metody wysyłki:** Na start hardcoded (kurier, paczkomat, odbiór).
   Późniejszy rozwój: zarządzanie z admina.
2. **Email z formularza kontaktowego:** Na start zapis do bazy. Później
   można dodać wysyłkę emaila (np. przez Resend).
3. **Powiadomienia email o zamówieniach:** Poza zakresem MVP. Można dodać
   po wdrożeniu.
4. **SEO i meta tagi:** Podstawowe (`title`, `description`) na każdej
   stronie. Zaawansowane (Open Graph, structured data) jako późniejszy
   rozwój.
5. **Responsywność:** Mobile-first. Wszystkie widoki działają na telefonie,
   tablecie i desktopie.
6. **Waluta:** Tylko PLN. Brak wielowalutowości.
