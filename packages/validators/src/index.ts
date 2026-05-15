import { z } from "zod";

export const tyreImageTypeSchema = z.enum(["hero", "gallery"]);

export const adminRoleSchema = z.enum(["admin", "manager", "viewer"]);

export const tyreCategorySchema = z.enum(["Radial", "Bais"]);

export const tyreVehicleTypeSchema = z.enum([
  "Earthmover",
  "Grader",
  "Loader and dozer",
  "Compactor",
  "Underground",
  "Mobile crane (High-speed)",
  "Mining and Logging",
  "Industrial"
]);

const optionalPositiveNumberSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().optional()
);

export const brandSchema = z.object({
  name: z.string().min(2).max(120),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

export const tyreProductSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(2).max(140),
  description: z.string().max(1200).optional(),
  category: tyreCategorySchema,
  pattern: z.string().min(1).max(80),
  tyreSize: z.string().min(2).max(40),
  tyreWeight: optionalPositiveNumberSchema,
  application: z.string().min(2).max(80),
  vehicleType: tyreVehicleTypeSchema.optional().or(z.literal("")),
  tyreType: z.string().max(80).optional(),
  starRating: z.string().max(20).optional(),
  plyRating: z.string().max(40).optional(),
  loadIndex: z.string().max(80).optional(),
  tyreFeatures: z.array(z.string().min(1).max(160)).default([]),
  isActive: z.boolean().default(true)
});

export const tyreImageSchema = z.object({
  tyreProductId: z.string().uuid(),
  imageUrl: z.string().url(),
  imageType: tyreImageTypeSchema.default("gallery"),
  isPrimaryImage: z.boolean().default(false)
});

export const enquiryItemSchema = z.object({
  tyreProductId: z.string().uuid()
});

export const enquirySchema = z.object({
  customerName: z.string().min(2).max(120),
  phone: z.string().min(7).max(24),
  email: z.string().email().optional().or(z.literal("")),
  companyName: z.string().max(160).optional(),
  message: z.string().max(1000).optional(),
  items: z.array(enquiryItemSchema).min(1)
});

export const userSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  role: adminRoleSchema.default("viewer"),
  isActive: z.boolean().default(true)
});

export const productSchema = tyreProductSchema;

export type BrandInput = z.infer<typeof brandSchema>;
export type TyreProductInput = z.infer<typeof tyreProductSchema>;
export type ProductInput = TyreProductInput;
export type TyreImageInput = z.infer<typeof tyreImageSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type UserInput = z.infer<typeof userSchema>;
