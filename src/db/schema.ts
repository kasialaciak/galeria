import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

// ============================================================
// AUTH TABLES
// ============================================================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: text("password"),
  role: text("role").default("user").notNull(),
  phone: text("phone"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ============================================================
// BUSINESS TABLES
// ============================================================

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  namePl: text("name_pl").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: text("parent_id"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    namePl: text("name_pl").notNull(),
    nameEn: text("name_en").notNull(),
    slug: text("slug").notNull().unique(),
    descriptionPl: text("description_pl"),
    descriptionEn: text("description_en"),
    price: integer("price").notNull(), // w groszach
    compareAtPrice: integer("compare_at_price"), // w groszach
    categoryId: text("category_id").references(() => categories.id),
    parentProductId: text("parent_product_id"),
    variantLabelPl: text("variant_label_pl"),
    variantLabelEn: text("variant_label_en"),
    specifications: jsonb("specifications").$type<{ label: string; value: string }[]>().default([]),
    stock: integer("stock").default(0).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    workTime: text("work_time"),
    viewCount: integer("view_count").default(0).notNull(),
    addToCartCount: integer("add_to_cart_count").default(0).notNull(),
    addToWishlistCount: integer("add_to_wishlist_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("products_category_idx").on(table.categoryId),
    parentIdx: index("products_parent_idx").on(table.parentProductId),
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
  })
);

export const productImages = pgTable("product_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    status: text("status").default("pending").notNull(), // pending | paid | shipped | delivered | cancelled
    totalAmount: integer("total_amount").notNull(), // w groszach
    shippingName: text("shipping_name").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: text("shipping_city").notNull(),
    shippingPostalCode: text("shipping_postal_code").notNull(),
    shippingCountry: text("shipping_country").default("PL").notNull(),
    shippingPhone: text("shipping_phone"),
    shippingPaczkomat: text("shipping_paczkomat"),
    shippingMethod: text("shipping_method").notNull(),
    shippingCost: integer("shipping_cost").notNull(),
    locale: text("locale").default("pl").notNull(),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    customerNotes: text("customer_notes"),
    couponCode: text("coupon_code"),
    discountAmount: integer("discount_amount").default(0).notNull(), // w groszach
    trackingUrl: text("tracking_url"),
    acceptedAt: timestamp("accepted_at"),
    shippedAt: timestamp("shipped_at"),
    termsAcceptedAt: timestamp("terms_accepted_at"),
    termsVersion: text("terms_version"),
    customWaiverAcceptedAt: timestamp("custom_waiver_accepted_at"),
    delayNotifiedAt: timestamp("delay_notified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("orders_user_idx").on(table.userId),
  })
);

export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // w groszach
  variantLabel: text("variant_label"),
});

export const wishlists = pgTable(
  "wishlists",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userProductUnique: uniqueIndex("wishlists_user_product_idx").on(
      table.userId,
      table.productId
    ),
  })
);

export const productReviews = pgTable(
  "product_reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userName: text("user_name").notNull(),
    rating: integer("rating").notNull(), // 1 - 5
    title: text("title"),
    comment: text("comment").notNull(),
    isApproved: boolean("is_approved").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("product_reviews_product_idx").on(table.productId),
    userIdx: index("product_reviews_user_idx").on(table.userId),
  })
);

export const homepageContent = pgTable("homepage_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  section: text("section").notNull(), // carousel | about
  titlePl: text("title_pl"),
  titleEn: text("title_en"),
  descriptionPl: text("description_pl"),
  descriptionEn: text("description_en"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").default("").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // percent | fixed
  value: integer("value").notNull(), // % albo grosze
  minOrderAmount: integer("min_order_amount").default(0).notNull(),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authThrottle = pgTable("auth_throttle", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  wishlists: many(wishlists),
  reviews: many(productReviews),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  parentProduct: one(products, {
    fields: [products.parentProductId],
    references: [products.id],
    relationName: "productVariants",
  }),
  variants: many(products, { relationName: "productVariants" }),
  images: many(productImages),
  orderItems: many(orderItems),
  wishlists: many(wishlists),
  reviews: many(productReviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productReviews.userId],
    references: [users.id],
  }),
}));

// ============================================================
// GALLERY TABLES
// ============================================================

export const galleryCategories = pgTable("gallery_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  namePl: text("name_pl").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const galleryWorks = pgTable(
  "gallery_works",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    categoryId: text("category_id")
      .notNull()
      .references(() => galleryCategories.id, { onDelete: "restrict" }),
    titlePl: text("title_pl").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionPl: text("description_pl"),
    descriptionEn: text("description_en"),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("gallery_works_category_idx").on(table.categoryId),
  })
);

export const galleryCategoriesRelations = relations(galleryCategories, ({ many }) => ({
  works: many(galleryWorks),
}));

export const galleryWorksRelations = relations(galleryWorks, ({ one }) => ({
  category: one(galleryCategories, {
    fields: [galleryWorks.categoryId],
    references: [galleryCategories.id],
  }),
}));
