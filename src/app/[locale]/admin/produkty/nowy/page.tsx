import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { ProductNewForm } from "./product-new-form";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  let catList: any[] = [];
  let parentProducts: any[] = [];

  try {
    catList = await db.select().from(categories).orderBy(categories.namePl);
    parentProducts = await db
      .select({ id: products.id, namePl: products.namePl })
      .from(products)
      .orderBy(products.namePl);
  } catch (e) {
    // fallback
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/produkty"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Wróć do listy produktów</span>
        </Link>
      </div>

      <div className="pb-4 border-b border-warm-gray">
        <h1 className="font-serif text-3xl font-bold text-forest">
          Dodaj Nowy Produkt
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Wypełnij poniższy formularz, aby wystawić rękodzieło do sprzedaży
        </p>
      </div>

      <ProductNewForm categories={catList} parentProducts={parentProducts} />
    </div>
  );
}
