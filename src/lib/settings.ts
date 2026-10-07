import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export type SiteSettings = {
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  sellerName: string;
  sellerAddress: string;
  sellerNip: string;
  shippingDays: string;
  holidayDates: string;
  storeEnabled: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  contactEmail: "kasialaciak.gallery@gmail.com",
  contactPhone: "",
  instagramUrl: "",
  sellerName: "",
  sellerAddress: "",
  sellerNip: "",
  shippingDays: "21",
  holidayDates: "",
  storeEnabled: "true",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.select().from(siteSettings);
    const merged: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      if (r.key in DEFAULT_SETTINGS && r.value !== "") {
        merged[r.key] = r.value;
      }
    }
    return merged as SiteSettings;
  } catch (e) {
    console.error("getSettings failed:", e);
    return DEFAULT_SETTINGS;
  }
}
