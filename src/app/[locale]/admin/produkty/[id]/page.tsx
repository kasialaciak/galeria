import { db } from "@/db";
import { categories, products, productImages } from "@/db/schema";
import { ProductEditForm } from "./product-edit-form";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { eq, asc, isNull } from "drizzle-orm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  const { id } = params;

  let product = null;
  let catList: any[] = [];
  let parentProducts: any[] = [];
  let images: any[] = [];

  try {
    const [fetchedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!fetchedProduct) {
      return notFound();
    }

    product = fetchedProduct;

    catList = await db.select().from(categories).orderBy(categories.namePl);
    parentProducts = await db
      .select({ id: products.id, namePl: products.namePl })
      .from(products)
      .where(isNull(products.parentProductId)) // opcjonalnie wyklucz warianty z parentów, albo pobierz wszystkie
      .orderBy(products.namePl);

    images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder));
  } catch (e) {
    console.error(e);
    return notFound();
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
          Edytuj Produkt
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Wprowadź zmiany dla wybranego produktu
        </p>
      </div>

      <ProductEditForm
        product={product}
        categories={catList}
        parentProducts={parentProducts}
        productImages={images}
      />
    </div>
  );
}
