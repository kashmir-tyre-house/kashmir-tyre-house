import { brands, getDb, tyreImages, tyreProducts } from "@kth/db";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminRole, requireAdmin } from "../../../../lib/auth";
import { uploadToR2 } from "../../../../lib/r2";

export const runtime = "nodejs";

const MAX_TYRE_IMAGES = 10;
const MAX_IMAGE_SIZE  = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BROCHURE_SIZE = 2 * 1024 * 1024;
const ALLOWED_BROCHURE_TYPES = ["application/pdf"];

const VEHICLE_TYPES = [
  "Earthmover",
  "Grader",
  "Loader and dozer",
  "Compactor",
  "Underground",
  "Mobile crane (High-speed)",
  "Mining and Logging",
  "Industrial",
] as const;

const SORTABLE_COLS = ["name", "category", "tyreSize", "application", "isActive", "createdAt"] as const;

const listQuerySchema = z.object({
  search:      z.string().optional(),
  brandId:     z.string().uuid().optional(),
  category:    z.enum(["Radial", "Bais", "Solid"]).optional(),
  vehicleType: z.enum(VEHICLE_TYPES).optional(),
  isActive:    z.enum(["true", "false"]).optional(),
  sortBy:      z.enum(SORTABLE_COLS).default("createdAt"),
  sortDir:     z.enum(["asc", "desc"]).default("desc"),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
  brandId:      z.string().uuid("Invalid brand ID."),
  name:         z.string().min(1).max(140),
  description:  z.string().max(2000).nullable().optional(),
  category:     z.enum(["Radial", "Bais", "Solid"]).nullable().optional(),
  pattern:      z.string().min(1).max(80),
  tyreSize:     z.string().min(1).max(40),
  tyreWeight:   z.number().positive().nullable().optional(),
  application:  z.string().min(1).max(80),
  vehicleType:  z.enum(VEHICLE_TYPES).nullable().optional(),
  tyreType:     z.string().max(80).nullable().optional(),
  starRating:   z.string().max(20).nullable().optional(),
  plyRating:    z.string().max(40).nullable().optional(),
  loadIndex:    z.string().max(80).nullable().optional(),
  rim:          z.string().max(80).nullable().optional(),
  treadDepth:   z.string().max(80).nullable().optional(),
  tyreFeatures: z.array(z.string()).default([]),
  isActive:     z.boolean().default(true),
});

// ── GET /api/admin/tyres ──────────────────────────────────────────────────────

export async function GET(request: Request) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid query parameters.", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { search, brandId, category, vehicleType, isActive, sortBy, sortDir, page, limit } = parsed.data;

    const conditions = [];
    if (search)      conditions.push(or(ilike(tyreProducts.name, `%${search}%`), ilike(tyreProducts.pattern, `%${search}%`)));
    if (brandId)     conditions.push(eq(tyreProducts.brandId, brandId));
    if (category)    conditions.push(eq(tyreProducts.category, category));
    if (vehicleType) conditions.push(eq(tyreProducts.vehicleType, vehicleType));
    if (isActive !== undefined) conditions.push(eq(tyreProducts.isActive, isActive === "true"));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const colMap = {
      name:        tyreProducts.name,
      category:    tyreProducts.category,
      tyreSize:    tyreProducts.tyreSize,
      application: tyreProducts.application,
      isActive:    tyreProducts.isActive,
      createdAt:   tyreProducts.createdAt,
    } as const;

    const orderCol  = colMap[sortBy];
    const orderExpr = sortDir === "asc" ? asc(orderCol) : desc(orderCol);

    const db = getDb();

    const [{ total }] = await db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(tyreProducts)
      .where(where);

    const rows = await db
      .select({
        id:           tyreProducts.id,
        name:         tyreProducts.name,
        description:  tyreProducts.description,
        category:     tyreProducts.category,
        pattern:      tyreProducts.pattern,
        tyreSize:     tyreProducts.tyreSize,
        tyreWeight:   tyreProducts.tyreWeight,
        application:  tyreProducts.application,
        vehicleType:  tyreProducts.vehicleType,
        tyreType:     tyreProducts.tyreType,
        starRating:   tyreProducts.starRating,
        plyRating:    tyreProducts.plyRating,
        loadIndex:    tyreProducts.loadIndex,
        rim:          tyreProducts.rim,
        treadDepth:   tyreProducts.treadDepth,
        tyreFeatures: tyreProducts.tyreFeatures,
        isActive:     tyreProducts.isActive,
        createdAt:    tyreProducts.createdAt,
        updatedAt:    tyreProducts.updatedAt,
        brand: {
          id:   brands.id,
          name: brands.name,
        },
      })
      .from(tyreProducts)
      .leftJoin(brands, eq(tyreProducts.brandId, brands.id))
      .where(where)
      .orderBy(orderExpr)
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      ok: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[tyres] GET list failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch tyres.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/tyres ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const formData = await request.formData();

    let body: unknown;
    try {
      body = JSON.parse(formData.get("data") as string);
    } catch {
      return NextResponse.json({ ok: false, message: "Invalid form data." }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const primaryIndex = Number(formData.get("primaryIndex") ?? 0);
    const imageFiles: File[] = [];
    for (let i = 0; i < MAX_TYRE_IMAGES; i++) {
      const file = formData.get(`image_${i}`);
      if (file instanceof File) imageFiles.push(file);
    }

    for (const file of imageFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { ok: false, message: `Invalid file type: ${file.name}. Only JPEG, PNG, and WEBP are allowed.` },
          { status: 422 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { ok: false, message: `File too large: ${file.name}. Maximum 3 MB per image.` },
          { status: 422 }
        );
      }
    }

    const brochureForm = formData.get("brochure");
    const brochureFile = brochureForm instanceof File && brochureForm.size > 0 ? brochureForm : null;
    if (brochureFile) {
      if (!ALLOWED_BROCHURE_TYPES.includes(brochureFile.type)) {
        return NextResponse.json(
          { ok: false, message: "Brochure must be a PDF file." },
          { status: 422 }
        );
      }
      if (brochureFile.size > MAX_BROCHURE_SIZE) {
        return NextResponse.json(
          { ok: false, message: "Brochure is too large. Maximum 2 MB." },
          { status: 422 }
        );
      }
    }

    const db = getDb();
    const [created] = await db
      .insert(tyreProducts)
      .values(parsed.data)
      .returning();

    if (brochureFile) {
      const key = `tyres/${created.id}/brochure-${Date.now()}.pdf`;
      await uploadToR2(Buffer.from(await brochureFile.arrayBuffer()), key, "application/pdf");
      await db
        .update(tyreProducts)
        .set({ brochureUrl: key, brochureName: brochureFile.name.slice(0, 200) })
        .where(eq(tyreProducts.id, created.id));
    }

    if (imageFiles.length > 0) {
      const imageRows = await Promise.all(
        imageFiles.map(async (file, index) => {
          const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
          const key = `tyres/${created.id}/${index}-${Date.now()}.${ext}`;
          const storedKey = await uploadToR2(Buffer.from(await file.arrayBuffer()), key, file.type);
          return {
            tyreProductId: created.id,
            imageUrl:      storedKey,
            imageType:     (index === primaryIndex ? "hero" : "gallery") as "hero" | "gallery",
            isPrimaryImage: index === primaryIndex,
          };
        })
      );
      await db.insert(tyreImages).values(imageRows);
    }

    return NextResponse.json({ ok: true, data: { id: created.id } }, { status: 201 });
  } catch (error) {
    console.error("[tyres] POST create failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create tyre product.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}
