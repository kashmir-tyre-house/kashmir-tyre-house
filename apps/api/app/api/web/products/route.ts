import { brands, getDb, tyreImages, tyreProducts } from "@kth/db";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { presignedUrl } from "../../../../lib/r2";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const listQuerySchema = z.object({
  search:   z.string().trim().min(1).optional(),
  brandId:  z.string().uuid().optional(),
  category: z.enum(["Radial", "Bais"]).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(48).default(24),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ── GET /api/web/products ─────────────────────────────────────────────────────
// Public, read-only product list.
// Filters: search (name/pattern), brandId, category. Only active products.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid query parameters.", errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { search, brandId, category, page, limit } = parsed.data;

    const conditions = [eq(tyreProducts.isActive, true)];
    if (search)   conditions.push(or(ilike(tyreProducts.name, `%${search}%`), ilike(tyreProducts.pattern, `%${search}%`))!);
    if (brandId)  conditions.push(eq(tyreProducts.brandId, brandId));
    if (category) conditions.push(eq(tyreProducts.category, category));

    const where = and(...conditions);

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
        tyreFeatures: tyreProducts.tyreFeatures,
        createdAt:    tyreProducts.createdAt,
        brand: {
          id:      brands.id,
          name:    brands.name,
          logoUrl: brands.logoUrl,
        },
      })
      .from(tyreProducts)
      .leftJoin(brands, eq(tyreProducts.brandId, brands.id))
      .where(where)
      .orderBy(desc(tyreProducts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Attach primary image (presigned) for each product on the page.
    const primaryImages = rows.length > 0
      ? await db
          .select({
            tyreProductId: tyreImages.tyreProductId,
            imageUrl:      tyreImages.imageUrl,
          })
          .from(tyreImages)
          .where(and(
            inArray(tyreImages.tyreProductId, rows.map((r) => r.id)),
            eq(tyreImages.isPrimaryImage, true)
          ))
      : [];

    const primaryByProduct = new Map(primaryImages.map((img) => [img.tyreProductId, img.imageUrl]));

    const data = await Promise.all(
      rows.map(async (row) => {
        const key = primaryByProduct.get(row.id);
        return {
          ...row,
          primaryImageUrl: key ? await presignedUrl(key, 3600) : null,
        };
      })
    );

    return NextResponse.json(
      {
        ok: true,
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[web/products] GET list failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch products.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
