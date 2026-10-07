"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { galleryCategories, galleryWorks, siteSettings, homepageContent } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function getGalleryCategories() {
  return db.select().from(galleryCategories).orderBy(asc(galleryCategories.sortOrder));
}

export async function addGalleryCategory(data: { namePl: string; nameEn: string; slug: string; sortOrder?: number }) {
  await requireAdmin();
  await db.insert(galleryCategories).values({
    namePl: data.namePl,
    nameEn: data.nameEn,
    slug: data.slug,
    sortOrder: data.sortOrder || 0,
  });
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function updateGalleryCategory(id: string, data: { namePl: string; nameEn: string; slug: string; sortOrder?: number }) {
  await requireAdmin();
  await db.update(galleryCategories).set(data).where(eq(galleryCategories.id, id));
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function deleteGalleryCategory(id: string) {
  await requireAdmin();
  await db.delete(galleryCategories).where(eq(galleryCategories.id, id));
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function getGalleryWorks() {
  return db.select().from(galleryWorks).orderBy(asc(galleryWorks.sortOrder), desc(galleryWorks.createdAt));
}

export async function addGalleryWork(data: {
  categoryId: string;
  titlePl: string;
  titleEn: string;
  descriptionPl?: string;
  descriptionEn?: string;
  imageUrl: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  await requireAdmin();
  await db.insert(galleryWorks).values({
    ...data,
    descriptionPl: data.descriptionPl || "",
    descriptionEn: data.descriptionEn || "",
    sortOrder: data.sortOrder || 0,
    isActive: data.isActive ?? true,
  });
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function updateGalleryWork(id: string, data: Partial<typeof galleryWorks.$inferInsert>) {
  await requireAdmin();
  await db.update(galleryWorks).set({ ...data, updatedAt: new Date() }).where(eq(galleryWorks.id, id));
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function deleteGalleryWork(id: string) {
  await requireAdmin();
  await db.delete(galleryWorks).where(eq(galleryWorks.id, id));
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function getGalleryCarousel() {
  return db
    .select()
    .from(homepageContent)
    .where(eq(homepageContent.section, "gallery_carousel"))
    .orderBy(asc(homepageContent.sortOrder));
}

export async function addGalleryCarouselImage(imageUrl: string, sortOrder: number = 0) {
  await requireAdmin();
  await db.insert(homepageContent).values({
    section: "gallery_carousel",
    imageUrl,
    sortOrder,
    isActive: true,
  });
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function deleteGalleryCarouselImage(id: string) {
  await requireAdmin();
  await db.delete(homepageContent).where(eq(homepageContent.id, id));
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}

export async function getGalleryDescription() {
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, "gallery_description"));
  return result[0]?.value || "";
}

export async function updateGalleryDescription(description: string) {
  await requireAdmin();
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, "gallery_description"));
  if (existing.length > 0) {
    await db.update(siteSettings).set({ value: description, updatedAt: new Date() }).where(eq(siteSettings.key, "gallery_description"));
  } else {
    await db.insert(siteSettings).values({ key: "gallery_description", value: description });
  }
  revalidatePath("/[locale]/admin/gallery", "page");
  revalidatePath("/[locale]/galeria", "page");
}
