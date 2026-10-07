# 🎨 Architektura Wyglądu i Funkcjonalności UX/UI – "Cosmic Loop"

Niniejszy dokument szczegółowo opisuje wygląd, układ wizualny oraz mapę funkcjonalności całego sklepu Cosmic Loop. Stanowi uzupełnienie technicznego pliku `PROJECT_CONTEXT.md` o warstwę użytkową, graficzną i projektową.

---

## 1. System Identyfikacji Wizualnej (Design System)

Sklep został zaprojektowany tak, aby oddawać organiczny, rękodzielniczy charakter (ceramika, glina, szydełko) przy zachowaniu nowoczesnej, czytelnej formy sklepu e-commerce.

### 1.1 Paleta Kolorów
- **Cream (`#FAF7F2`)** – Główne tło strony. Złamana, ciepła biel imitująca naturalny papier/płótno. Nie męczy wzroku i świetnie eksponuje zdjęcia produktów.
- **Charcoal (`#2D2A26`)** – Główny kolor tekstu. Zamiast czystej czerni, to ciemny, węglowy odcień, który dodaje projektowi miękkości.
- **Forest (`#1B4D3E`)** – Ciemna, butelkowa zieleń. Używana jako główny kolor akcentujący (`primary`), np. tło ważnych przycisków, ważne nagłówki czy etykiety w panelu.
- **Teal (`#3D8B7A`)** & **Sage (`#E8F0EC`)** – Jaśniejsze, przygaszone zielenie, używane do interakcji, najechaniem myszką (`hover`) lub jako delikatne tła powiadomień.
- **Clay (`#C4704A`)** – Kolor wypalanej gliny/terakoty. Pełni rolę drugoplanowego akcentu, używany często do przycisków typu "Dodaj do koszyka" czy wyróżnień wyprzedaży.
- **Warm Gray (`#E8E2DA`)** – Ciepły, piaskowy szary, używany do subtelnych obramowań (borders) i linii oddzielających sekcje, by unikać ostrych, cyfrowych kontrastów.

### 1.2 Typografia
- **Nagłówki (Font Serif):** `Playfair Display` – Klasyczna, szeryfowa czcionka z eleganckimi detalami, dodająca marce Cosmic Loop charakteru "premium" i artystycznego sznytu.
- **Tekst główny (Font Sans):** `Inter` – Nowoczesna, czysta i bardzo czytelna czcionka bezszeryfowa do długich opisów, regulaminów i interfejsu (przyciski, formularze).

---

## 2. Mapa Nawigacji (Układ Główny)

### 2.1 Pasek informacyjny (Delivery Banner)
Zawsze widoczny na samej górze wąski pasek z tłem `forest` i białym tekstem, informujący odwiedzających o unikalnym charakterze sklepu: *"Wszystkie produkty tworzymy ręcznie na Twoje zamówienie (czas realizacji do 21 dni)"*.

### 2.2 Nagłówek (Header)
Zawiera:
- **Logo (lewa strona):** Placeholder kwadratowego logo Cosmic Loop z artystycznym napisem.
- **Główne Menu:** Linki do "Produkty", "O nas", "Kontakt".
- **Ikony narzędziowe (prawa strona):** Lupa (wyszukiwarka), Serce (lista życzeń), Koszyk (z czerwonym/glinianym licznikiem ilości sztuk), oraz ikona Profilu/Konta (do logowania).

### 2.3 Stopka (Footer)
Sekcja u dołu strony na tle `forest` lub ciemnym:
- Kolumna 1: Informacje o firmie, nazwa sklepu, krótki opis działalności (sklep z rękodziełem).
- Kolumna 2: Szybkie linki (Konto, Koszyk, Regulamin, Polityka Prywatności).
- Kolumna 3: Opcje kontaktu, adres e-mail (`cosmic.loop.core+shoop@gmail.com`) i ikonka Instagrama kierująca na profil `cosmic_loop.craft`.

---

## 3. Kluczowe Widoki Strony (Front-end)

### 3.1 Strona Główna
Zaprojektowana jako nowoczesna witryna e-commerce:
1. **Hero Section (Karuzela):** Duży, estetyczny obszar z przesuwającymi się zdjęciami najwyższej jakości (promujące ceramikę, biżuterię, pluszaki) oraz przyciskiem "Kup teraz".
2. **Kategorie (Bąbelki):** Okrągłe ikonki/zdjęcia prowadzące bezpośrednio do podziału: "Szydełko", "Ceramika", "Biżuteria".
3. **Polecane / Nowości:** Karuzela lub siatka kart produktowych z najnowszym asortymentem.
4. **O Nas (Sekcja wizerunkowa):** Tekst i zdjęcie przybliżające filozofię marki Cosmic Loop i pasję do tworzenia rękodzieła.

### 3.2 Katalog i Karta Produktu
- **Siatka Produktów:** Produkty wyświetlane jako czyste kafelki. W prawym górnym rogu zdjęcia może widnieć ikona serduszka (Dodaj do życzeń). Cena mocno wyróżniona. Brak napisów "Stan magazynowy: X", zamiast tego widnieje elegancki dopisek: *"Robione na zamówienie"*.
- **Strona Pojedynczego Produktu:**
  - Duże zdjęcie po lewej, galeria miniatur pod spodem.
  - Tytuł pisany fontem szeryfowym (`Playfair Display`).
  - Pole wyboru "Uwagi do zamówienia" (np. wybór koloru).
  - Przycisk "Dodaj do koszyka" (kolor `clay` lub `forest`).
  - Zakładki (Tabs) poniżej: "Opis", "Wysyłka i Zwroty" (wyraźnie komunikujące 21 dni roboczych).

### 3.3 Koszyk i Kasa (Checkout)
Zaprojektowane, by budzić pełne zaufanie (tzw. "High trust flow"):
- Podsumowanie zawartości ze zdjęciami po prawej stronie.
- Pole na **Kupon Rabatowy** – umożliwiające wpisanie kodu (np. ZIMA20) i odświeżające kwotę dynamicznie.
- Wybór metody dostawy za pomocą estetycznych kafelków "Radio Buttons" (Paczkomat, Kurier, Odbiór osobisty).
- Obowiązkowe **Checkboxy zgód prawnych**, obejmujące zapoznanie się z regulaminem i informacją o braku zwrotu na rzeczy robione według wytycznych klienta.
- Wyróżniony przycisk z tekstem uregulowanym prawnie: **"Zamawiam z obowiązkiem zapłaty"**.

---

## 4. Wygląd Panelu Administratora (Backend / Admin)
Dostępny po zalogowaniu na konto uprzywilejowane. Charakteryzuje się bardziej "narzędziowym", ascetycznym wyglądem, by przyspieszyć pracę.

- **Menu boczne (Sidebar):** Po lewej stronie ekranu. Główne zakładki: Strona Główna, Kategorie, Produkty, Zamówienia, Ustawienia sklepu, Kupony.
- **Produkty (Lista i Formularz):** 
  - Tabela z listą produktów, miniaturek, ceny, statusu (Aktywny/Szkic). 
  - Przy dodawaniu produktu system zdejmuje ciężar wpisywania "stanów magazynowych" i skupia się na nazwie, kategorii, zdjęciach i cenie.
- **Zamówienia (Zarządzanie operacyjne):**
  - Intuicyjna tabela ze statusem (Złożone, Opłacone, Wysłane, Anulowane).
  - Selektor wyboru statusu, który automatycznie strzela powiadomieniem **E-mail na skrzynkę klienta**.
  - Opcja jednym kliknięciem: "Wyślij e-mail o potencjalnym opóźnieniu", niezwykle przydatna w biznesie rękodzielniczym.
- **Kupony:** Lista kafelkowa ukazująca utworzone kody zniżkowe (np. "-15%"), ile razy zostały użyte i przycisk usunięcia.
- **Ustawienia:** Formularz z polami tekstowymi do zmiany adresu email, Instagrama i tekstu stopki na żywo, bez konieczności ingerencji w kod źródłowy.

---

## 5. Mobile (RWD - Responsywność)
Cała strona jest oparta na bibliotece Tailwind CSS `mobile-first`:
- Na smartfonach górne menu zamienia się w "Hamburger Menu" wysuwane z boku (tzw. Sheet).
- Siatki produktów redukują się z 4-3 kolumn do 2 lub 1 kolumny, idealnych do płynnego scrollowania kciukiem.
- Elementy dotykowe (przyciski, pola checkoutu) są odpowiednio powiększone, aby łatwo w nie trafiać.

### 3.4 Kontakt (Formularz)
- Usunięto dane adresowe (pracownia nie przyjmuje gości). Zostawiono e-mail i telefon.
- Do formularza dodano przycisk **UploadButton** umożliwiający załączenie JEDNEGO zdjęcia (do 4MB). Link do załącznika automatycznie dopisuje się do treści wiadomości dla admina.
- Dodano dyskretny dopisek: *"Ze względów bezpieczeństwa żadne linki w treści wiadomości nie będą otwierane."*


### 3.5 Aktualizacje UX Koszyka i Kasy
- **Opróżnianie koszyka:** Po pomyślnym zatwierdzeniu zamówienia i przekierowaniu do płatności (Stripe), koszyk po stronie klienta (Zustand) czyści się od razu (zero-state problem fixed).
- **Telefon:** Wymagane pole przy składaniu zamówienia dla firm kurierskich.
- **Kod Paczkomatu:** Pole pojawia się płynnie i warunkowo (conditional rendering) TYLKO gdy klient wybierze w radioboxach dostawę paczkomatem. Zawiera pomocny link do wyszukiwarki punktów InPost.


## 4.1 Zmiany UI w Zarządzaniu Zamówieniami (Admin)
- Podgląd zamówień wyłuskuje i wyświetla numer telefonu oraz dokładny kod Paczkomatu klienta (jeśli był podany).
- Zmiana statusu na **"Wysłane"** za pomocą dropdowna wyświetla przeglądarkowy pop-up (window.prompt), prosząc o opcjonalny link do śledzenia (Tracking URL), który następnie jest dostarczany klientowi w mailu potwierdzającym wysyłkę.
