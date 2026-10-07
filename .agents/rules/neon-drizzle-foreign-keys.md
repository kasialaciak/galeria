---
name: neon-drizzle-foreign-keys
description: Zasady usuwania powiązanych danych w Drizzle ORM
always_on: true
---
# Drizzle ORM Foreign Keys
Kiedy piszesz skrypty czyszczące bazę danych (seedy) lub usuwasz rekordy, zawsze usuwaj najpierw rekordy z tabel podrzędnych (zależnych), a dopiero potem z tabel nadrzędnych. 
Zawsze uwzględnij tabele powiązane, takie jak `order_items`, `orders`, `wishlists`, zanim usuniesz tabele `products` lub `categories`, aby uniknąć błędu `violates foreign key constraint`.
