"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .concat("-", Date.now().toString(36).slice(-4));
}

export async function createProductAction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Brak uprawnień administratora" };
  }

  const namePl = formData.get("namePl") as string;
  const nameEn = formData.get("nameEn") as string;
  const descriptionPl = formData.get("descriptionPl") as string;
  const descriptionEn = formData.get("descriptionEn") as string;
  const priceZloty = parseFloat(formData.get("price") as string);
  const compareAtPriceZloty = parseFloat(formData.get("compareAtPrice") as string);
  const categoryId = (formData.get("categoryId") as string) || null;
  const parentProductId = (formData.get("parentProductId") as string) || null;
  const variantLabelPl = (formData.get("variantLabelPl") as string) || null;
  const variantLabelEn = (formData.get("variantLabelEn") as string) || null;
  
  const isPublished = formData.get("isPublished") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  // Specyfikacja w formacie JSON (kafelki)
  const specificationsRaw = formData.get("specifications") as string;
  let specifications: { label: string; value: string }[] = [];
  if (specificationsRaw) {
    try {
      specifications = JSON.parse(specificationsRaw);
    } catch (e) {
      specifications = [];
    }
  }

  // Zdjęcia w postaci linków (URL)
  const imageUrlsRaw = formData.get("imageUrls") as string;
  const imageUrls = imageUrlsRaw
    ? imageUrlsRaw
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 0)
    : [];

  if (!namePl || isNaN(priceZloty)) {
    return { success: false, error: "Podaj prawidłową nazwę i cenę produktu" };
  }

  const priceInGrosze = Math.round(priceZloty * 100);
  const compareAtInGrosze = !isNaN(compareAtPriceZloty)
    ? Math.round(compareAtPriceZloty * 100)
    : null;

  const slug = slugify(namePl);

  try {
    const [newProduct] = await db
      .insert(products)
      .values({
        namePl,
        nameEn: nameEn || namePl,
        slug,
        descriptionPl,
        descriptionEn: descriptionEn || descriptionPl,
        price: priceInGrosze,
        compareAtPrice: compareAtInGrosze,
        categoryId: categoryId === "none" ? null : categoryId,
        parentProductId: parentProductId === "none" ? null : parentProductId,
        variantLabelPl,
        variantLabelEn: variantLabelEn || variantLabelPl,
        specifications,
        isPublished,
        isFeatured,
      })
      .returning({ id: products.id });

    if (newProduct && imageUrls.length > 0) {
      await db.insert(productImages).values(
        imageUrls.map((url, idx) => ({
          productId: newProduct.id,
          url,
          sortOrder: idx,
        }))
      );
    }

    revalidatePath("/admin/produkty");
    revalidatePath("/produkty");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: "Błąd podczas zapisywania produktu w bazie" };
  }
}

export async function deleteProductAction(productId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.delete(products).where(eq(products.id, productId));
    revalidatePath("/admin/produkty");
    revalidatePath("/produkty");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Nie udało się usunąć produktu" };
  }
}

export async function getAdminProductsList() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") return [];

  try {
    const list = await db
      .select({
        id: products.id,
        namePl: products.namePl,
        slug: products.slug,
        price: products.price,

        isPublished: products.isPublished,
        isFeatured: products.isFeatured,
        viewCount: products.viewCount,
        addToCartCount: products.addToCartCount,
        addToWishlistCount: products.addToWishlistCount,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

    const images = await db.select().from(productImages);
    const imgMap = new Map<string, string>();
    for (const img of images) {
      if (!imgMap.has(img.productId)) {
        imgMap.set(img.productId, img.url);
      }
    }

    return list.map((p) => ({
      ...p,
      imageUrl: imgMap.get(p.id) || null,
    }));
  } catch (error) {
    console.warn("Could not query admin products:", error);
    return [];
  }
}
