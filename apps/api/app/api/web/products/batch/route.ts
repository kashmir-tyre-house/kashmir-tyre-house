import { brands, getDb, tyreImages, tyreProducts } from "@kth/db";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { presignedUrl } from "../../../../../lib/r2";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const bodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ── POST /api/web/products/batch ──────────────────────────────────────────────
// Public, read-only. Accepts { ids: string[] } and returns details for the
// matching ACTIVE products (inactive/missing ids are silently omitted).
// Results preserve the order of the requested ids.

export async function POST(request: Request) {
  try {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Invalid JSON body." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request body. Expected { ids: string[] } of product UUIDs.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // De-duplicate while keeping the requested order for the response.
    const requestedIds = [...new Set(parsed.data.ids)];

    const db = getDb();

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
        rim:          tyreProducts.rim,
        treadDepth:   tyreProducts.treadDepth,
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
      .where(and(inArray(tyreProducts.id, requestedIds), eq(tyreProducts.isActive, true)));

    // Fetch every image for the matched products in one query, then group.
    const matchedIds = rows.map((r) => r.id);
    const rawImages =
      matchedIds.length > 0
        ? await db
            .select({
              tyreProductId:  tyreImages.tyreProductId,
              id:             tyreImages.id,
              imageUrl:       tyreImages.imageUrl,
              imageType:      tyreImages.imageType,
              isPrimaryImage: tyreImages.isPrimaryImage,
            })
            .from(tyreImages)
            .where(inArray(tyreImages.tyreProductId, matchedIds))
            .orderBy(asc(tyreImages.createdAt))
        : [];

    const presignedById = new Map(
      await Promise.all(
        rawImages.map(
          async (img) => [img.id, await presignedUrl(img.imageUrl, 3600)] as const
        )
      )
    );

    const imagesByProduct = new Map<string, Array<Record<string, unknown>>>();
    for (const img of rawImages) {
      const list = imagesByProduct.get(img.tyreProductId) ?? [];
      list.push({
        id:             img.id,
        url:            presignedById.get(img.id) ?? null,
        imageType:      img.imageType,
        isPrimaryImage: img.isPrimaryImage,
      });
      imagesByProduct.set(img.tyreProductId, list);
    }

    const byId = new Map(
      rows.map((row) => [row.id, { ...row, images: imagesByProduct.get(row.id) ?? [] }])
    );

    // Preserve requested order; drop ids that weren't found / are inactive.
    const data = requestedIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    return NextResponse.json({ ok: true, data }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[web/products] POST batch failed", error);
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
