import { z } from "zod";
import { newPasswordSchema } from "./password";

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  password: newPasswordSchema,
});

export const profileSchema = z.object({
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  phone: z.string().optional(),
});

export const productSchema = z.object({
  namePl: z.string().min(1, "Nazwa PL jest wymagana"),
  nameEn: z.string().min(1, "Nazwa EN jest wymagana"),
  descriptionPl: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().positive("Cena musi być dodatnia"),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Kategoria jest wymagana"),

  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  parentProductId: z.string().optional().nullable(),
  variantLabelPl: z.string().optional().nullable(),
  variantLabelEn: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  namePl: z.string().min(1, "Nazwa PL jest wymagana"),
  nameEn: z.string().min(1, "Nazwa EN jest wymagana"),
  slug: z.string().min(1, "Slug jest wymagany"),
  parentId: z.string().optional().nullable(),
});

export const checkoutSchema = z
  .object({
    shippingName: z.string().min(2, "Imię i nazwisko jest wymagane"),
    shippingAddress: z.string().optional().default(""),
    shippingCity: z.string().optional().default(""),
    shippingPostalCode: z.string().optional().default(""),
    shippingCountry: z.string().default("PL"),
    shippingMethod: z.enum(["kurier", "paczkomat", "odbior", "eu_courier"]),
    shippingPhone: z.string().min(5, "Telefon jest wymagany"),
    shippingPaczkomat: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === "paczkomat") {
      if (!data.shippingPaczkomat || data.shippingPaczkomat.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Wybierz lub wpisz kod paczkomatu",
          path: ["shippingPaczkomat"],
        });
      }
    }

    if (data.shippingCountry !== "PL" && data.shippingMethod !== "eu_courier") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dla wysyłki zagranicznej wybierz opcję 'Przesyłka zagraniczna (UE)'",
        path: ["shippingMethod"],
      });
    }

    if (data.shippingCountry === "PL" && data.shippingMethod === "eu_courier") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dla wysyłki w Polsce wybierz inną opcję dostawy",
        path: ["shippingMethod"],
      });
    }

    if (data.shippingMethod !== "odbior") {
      if (!data.shippingAddress || data.shippingAddress.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Adres musi mieć min. 5 znaków",
          path: ["shippingAddress"],
        });
      }
      if (!data.shippingCity || data.shippingCity.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Miasto musi mieć min. 2 znaki",
          path: ["shippingCity"],
        });
      }
      if (!data.shippingPostalCode || !/^\d{2,10}[-\s]?\d{0,10}$/.test(data.shippingPostalCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Podaj prawidłowy kod pocztowy",
          path: ["shippingPostalCode"],
        });
      }
    }
  });

export const contactSchema = z.object({
  name: z.string().min(2, "Imię jest wymagane"),
  email: z.string().email("Nieprawidłowy email"),
  subject: z.string().min(3, "Temat jest wymagany"),
  message: z.string().min(10, "Wiadomość musi mieć min. 10 znaków"),
});

export const settingsSchema = z.object({
  contactEmail: z.string().email(),
  contactPhone: z.string().max(30),
  instagramUrl: z.string().url().refine((u) => u.startsWith('https://www.instagram.com/') || u.startsWith('https://instagram.com/'), 'Podaj link do Instagrama'),
  sellerName: z.string().max(200),
  sellerAddress: z.string().max(200),
  sellerNip: z.string().regex(/^(\d{10})?$/, 'NIP: 10 cyfr lub puste'),
  shippingDays: z.string().regex(/^\d{1,3}$/),
  holidayDates: z.string().optional(),
});
