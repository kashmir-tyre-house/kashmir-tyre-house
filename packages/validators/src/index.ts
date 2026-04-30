import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "active", "archived"]);

export const productSchema = z.object({
  name: z.string().min(2).max(140),
  brand: z.string().min(2).max(80),
  size: z.string().min(2).max(40),
  vehicleType: z.string().min(2).max(80),
  plyRating: z.string().max(40).optional(),
  loadIndex: z.string().max(40).optional(),
  priceNote: z.string().max(120).optional(),
  description: z.string().max(1200).optional(),
  status: productStatusSchema.default("draft")
});

export const enquiryItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99).default(1)
});

export const enquirySchema = z.object({
  customerName: z.string().min(2).max(120),
  phone: z.string().min(7).max(24),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  items: z.array(enquiryItemSchema).min(1)
});

export type ProductInput = z.infer<typeof productSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
