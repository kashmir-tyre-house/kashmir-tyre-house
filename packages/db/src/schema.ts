import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const productStatus = pgEnum("product_status", [
  "draft",
  "active",
  "archived"
]);

export const enquiryStatus = pgEnum("enquiry_status", [
  "new",
  "contacted",
  "closed"
]);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 140 }).notNull(),
    brand: varchar("brand", { length: 80 }).notNull(),
    size: varchar("size", { length: 40 }).notNull(),
    vehicleType: varchar("vehicle_type", { length: 80 }).notNull(),
    plyRating: varchar("ply_rating", { length: 40 }),
    loadIndex: varchar("load_index", { length: 40 }),
    priceNote: varchar("price_note", { length: 120 }),
    description: text("description"),
    status: productStatus("status").default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("products_status_idx").on(table.status),
    index("products_size_idx").on(table.size),
    index("products_vehicle_type_idx").on(table.vehicleType)
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    url: text("url").notNull(),
    alt: varchar("alt", { length: 180 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [index("product_images_product_id_idx").on(table.productId)]
);

export const enquiries = pgTable("enquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  email: varchar("email", { length: 160 }),
  message: text("message"),
  status: enquiryStatus("status").default("new").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
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
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "restrict" })
      .notNull(),
    quantity: integer("quantity").default(1).notNull()
  },
  (table) => [
    index("enquiry_items_enquiry_id_idx").on(table.enquiryId),
    index("enquiry_items_product_id_idx").on(table.productId)
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
