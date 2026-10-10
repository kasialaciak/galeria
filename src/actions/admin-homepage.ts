"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { homepageContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function addCarouselSlideAction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const imageUrl = formData.get("imageUrl") as string;
  const rawData = {
    titlePl: formData.get("titlePl"),
    descriptionPl: formData.get("descriptionPl"),
    titleEn: formData.get("titleEn"),
    descriptionEn: formData.get("descriptionEn"),
  };

  const parsed = promoSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Nieprawidłowe dane formularza" };
  }

  const { titlePl, descriptionPl, titleEn, descriptionEn } = parsed.data;
  const linkUrl = formData.get("linkUrl") as string;

  if (!imageUrl) {
    return { success: false, error: "Adres URL zdjęcia jest wymagany" };
  }

  try {
    await db.insert(homepageContent).values({
      section: "carousel",
      imageUrl,
      titlePl: titlePl || null,
      descriptionPl: descriptionPl || null,
      titleEn: titleEn || null,
      descriptionEn: descriptionEn || null,
      linkUrl: linkUrl || "/produkty",
      isActive: true,
      sortOrder: 1,
    });

    revalidatePath("/admin/strona-glowna");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding slide:", error);
    return { success: false, error: "Błąd podczas dodawania slajdu" };
  }
}

export async function deleteCarouselSlideAction(slideId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.delete(homepageContent).where(eq(homepageContent.id, slideId));
    revalidatePath("/admin/strona-glowna");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting slide:", error);
    return { success: false, error: "Błąd podczas usuwania slajdu" };
  }
}

export async function updateAboutSectionAction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    titlePl: formData.get("titlePl"),
    descriptionPl: formData.get("descriptionPl"),
    titleEn: formData.get("titleEn"),
    descriptionEn: formData.get("descriptionEn"),
  };

  const parsed = promoSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Nieprawidłowe dane formularza" };
  }

  const { titlePl, descriptionPl, titleEn, descriptionEn } = parsed.data;
  const imageUrl = formData.get("imageUrl") as string;

  try {
    const existing = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "about"))
      .limit(1);

    if (existing && existing.length > 0) {
      await db
        .update(homepageContent)
        .set({
          titlePl,
          descriptionPl,
          titleEn,
          descriptionEn,
          imageUrl: imageUrl || existing[0].imageUrl,
        })
        .where(eq(homepageContent.id, existing[0].id));
    } else {
      await db.insert(homepageContent).values({
        section: "about",
        titlePl,
        descriptionPl,
        titleEn,
        descriptionEn,
        imageUrl,
        isActive: true,
      });
    }

    revalidatePath("/admin/strona-glowna");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating about section:", error);
    return { success: false, error: "Błąd podczas zapisu sekcji" };
  }
}


const promoSchema = z.object({
  titlePl: z.string().min(1, "Tytuł jest wymagany"),
  descriptionPl: z.string().min(1, "Opis jest wymagany"),
  titleEn: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
});

export async function updatePromoSectionAction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    titlePl: formData.get("titlePl"),
    descriptionPl: formData.get("descriptionPl"),
    titleEn: formData.get("titleEn"),
    descriptionEn: formData.get("descriptionEn"),
  };

  const parsed = promoSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Nieprawidłowe dane formularza" };
  }

  const { titlePl, descriptionPl, titleEn, descriptionEn } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "gallery_promo"))
      .limit(1);

    if (existing && existing.length > 0) {
      await db
        .update(homepageContent)
        .set({
          titlePl,
          descriptionPl,
          titleEn,
          descriptionEn,
        })
        .where(eq(homepageContent.id, existing[0].id));
    } else {
      await db.insert(homepageContent).values({
        section: "gallery_promo",
        titlePl,
        descriptionPl,
        titleEn,
        descriptionEn,
        isActive: true,
      });
    }

    revalidatePath("/admin/strona-glowna");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating promo section:", error);
    return { success: false, error: "Błąd podczas zapisu sekcji" };
  }
}
