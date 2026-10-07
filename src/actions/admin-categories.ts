"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}

export async function createCategoryAction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Brak uprawnień" };
  }

  const namePl = formData.get("namePl") as string;
  const nameEn = formData.get("nameEn") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const image = (formData.get("image") as string) || null;

  if (!namePl) {
    return { success: false, error: "Nazwa kategorii jest wymagana" };
  }

  const slug = slugify(namePl);

  try {
    await db.insert(categories).values({
      namePl,
      nameEn: nameEn || namePl,
      slug,
      parentId: parentId === "none" ? null : parentId,
      image,
    });

    revalidatePath("/admin/kategorie");
    revalidatePath("/produkty");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Błąd podczas tworzenia kategorii" };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.delete(categories).where(eq(categories.id, categoryId));
    revalidatePath("/admin/kategorie");
    revalidatePath("/produkty");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Nie udało się usunąć kategorii" };
  }
}
