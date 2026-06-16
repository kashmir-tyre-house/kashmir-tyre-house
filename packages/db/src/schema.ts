import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const enquiryStatus = pgEnum("enquiry_status", [
  "new",
  "contacted",
  "closed"
]);

export const tyreImageType = pgEnum("tyre_image_type", ["hero", "gallery"]);

export const adminRole = pgEnum("admin_role", ["admin", "manager", "viewer"]);

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("brands_name_unique").on(table.name),
    index("brands_is_active_idx").on(table.isActive)
  ]
);

export const tyreProducts = pgTable(
  "tyre_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandId: uuid("brand_id")
      .references(() => brands.id, { onDelete: "restrict" })
      .notNull(),
    name: varchar("name", { length: 140 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 80 }),
    pattern: varchar("pattern", { length: 80 }).notNull(),
    tyreSize: varchar("tyre_size", { length: 40 }).notNull(),
    tyreWeight: numeric("tyre_weight", {
      precision: 10,
      scale: 2,
      mode: "number"
    }),
    application: varchar("application", { length: 80 }).notNull(),
    vehicleType: varchar("vehicle_type", { length: 120 }),
    tyreType: varchar("tyre_type", { length: 80 }),
    starRating: varchar("star_rating", { length: 20 }),
    plyRating: varchar("ply_rating", { length: 40 }),
    loadIndex: varchar("load_index", { length: 80 }),
    rim: varchar("rim", { length: 80 }),
    treadDepth: varchar("tread_depth", { length: 80 }),
    tyreFeatures: jsonb("tyre_features").$type<string[]>().default([]).notNull(),
    brochureUrl: text("brochure_url"),
    brochureName: varchar("brochure_name", { length: 200 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("tyre_products_brand_id_idx").on(table.brandId),
    index("tyre_products_is_active_idx").on(table.isActive),
    index("tyre_products_category_idx").on(table.category),
    index("tyre_products_pattern_idx").on(table.pattern),
    index("tyre_products_tyre_size_idx").on(table.tyreSize),
    index("tyre_products_tyre_weight_idx").on(table.tyreWeight),
    index("tyre_products_application_idx").on(table.application),
    index("tyre_products_vehicle_type_idx").on(table.vehicleType),
    check(
      "tyre_products_category_check",
      sql`${table.category} in ('Radial', 'Bais', 'Solid')`
    ),
    check(
      "tyre_products_tyre_weight_check",
      sql`${table.tyreWeight} is null or ${table.tyreWeight} > 0`
    ),
    check(
      "tyre_products_vehicle_type_check",
      sql`${table.vehicleType} is null or ${table.vehicleType} in ('Earthmover', 'Grader', 'Loader and dozer', 'Compactor', 'Underground', 'Mobile crane (High-speed)', 'Mining and Logging', 'Industrial')`
    )
  ]
);

export const tyreImages = pgTable(
  "tyre_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tyreProductId: uuid("tyre_product_id")
      .references(() => tyreProducts.id, { onDelete: "cascade" })
      .notNull(),
    imageUrl: text("image_url").notNull(),
    imageType: tyreImageType("image_type").default("gallery").notNull(),
    isPrimaryImage: boolean("is_primary_image").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("tyre_images_tyre_product_id_idx").on(table.tyreProductId),
    index("tyre_images_image_type_idx").on(table.imageType),
    index("tyre_images_is_primary_image_idx").on(table.isPrimaryImage)
  ]
);

export const enquiries = pgTable("enquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  email: varchar("email", { length: 160 }),
  companyName: varchar("company_name", { length: 160 }),
  message: text("message"),
  status: enquiryStatus("status").default("new").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const enquiryItems = pgTable(
  "enquiry_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enquiryId: uuid("enquiry_id")
      .references(() => enquiries.id, { onDelete: "cascade" })
      .notNull(),
    tyreProductId: uuid("tyre_product_id")
      .references(() => tyreProducts.id, { onDelete: "restrict" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("enquiry_items_enquiry_id_idx").on(table.enquiryId),
    index("enquiry_items_tyre_product_id_idx").on(table.tyreProductId)
  ]
);

export const aboutImages = pgTable("about_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 180 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: text("password_hash"),
    role: adminRole("role").default("viewer").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("admin_users_email_unique").on(table.email),
    index("admin_users_role_idx").on(table.role),
    index("admin_users_is_active_idx").on(table.isActive)
  ]
);

export const adminPasswordResetTokens = pgTable(
  "admin_password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminUserId: uuid("admin_user_id")
      .references(() => adminUsers.id, { onDelete: "cascade" })
      .notNull(),
    codeHash: text("code_hash").notNull(),
    resetTokenHash: text("reset_token_hash"),
    attempts: integer("attempts").default(0).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("admin_password_reset_tokens_admin_user_id_idx").on(
      table.adminUserId
    ),
    index("admin_password_reset_tokens_expires_at_idx").on(table.expiresAt),
    index("admin_password_reset_tokens_reset_token_hash_idx").on(
      table.resetTokenHash
    )
  ]
);

export const brandsRelations = relations(brands, ({ many }) => ({
  tyreProducts: many(tyreProducts)
}));

export const tyreProductsRelations = relations(tyreProducts, ({ many, one }) => ({
  brand: one(brands, {
    fields: [tyreProducts.brandId],
    references: [brands.id]
  }),
  images: many(tyreImages),
  enquiryItems: many(enquiryItems)
}));

export const tyreImagesRelations = relations(tyreImages, ({ one }) => ({
  tyreProduct: one(tyreProducts, {
    fields: [tyreImages.tyreProductId],
    references: [tyreProducts.id]
  })
}));

export const enquiriesRelations = relations(enquiries, ({ many }) => ({
  items: many(enquiryItems)
}));

export const enquiryItemsRelations = relations(enquiryItems, ({ one }) => ({
  enquiry: one(enquiries, {
    fields: [enquiryItems.enquiryId],
    references: [enquiries.id]
  }),
  tyreProduct: one(tyreProducts, {
    fields: [enquiryItems.tyreProductId],
    references: [tyreProducts.id]
  })
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  passwordResetTokens: many(adminPasswordResetTokens)
}));

export const adminPasswordResetTokensRelations = relations(
  adminPasswordResetTokens,
  ({ one }) => ({
    adminUser: one(adminUsers, {
      fields: [adminPasswordResetTokens.adminUserId],
      references: [adminUsers.id]
    })
  })
);
