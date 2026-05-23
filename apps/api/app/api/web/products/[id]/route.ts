import { brands, getDb, tyreImages, tyreProducts } from "@kth/db";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { presignedUrl } from "../../../../../lib/r2";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function notFound() {
  return NextResponse.json(
    { ok: false, message: "Product not found." },
    { status: 404, headers: CORS_HEADERS }
  );
}

// ── GET /api/web/products/[id] ────────────────────────────────────────────────
// Public details for an active product. Returns 404 if missing or inactive.

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const [row] = await db
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
      .where(and(eq(tyreProducts.id, id), eq(tyreProducts.isActive, true)))
      .limit(1);

    if (!row) return notFound();

    const rawImages = await db
      .select({
        id:             tyreImages.id,
        imageUrl:       tyreImages.imageUrl,
        imageType:      tyreImages.imageType,
        isPrimaryImage: tyreImages.isPrimaryImage,
      })
      .from(tyreImages)
      .where(eq(tyreImages.tyreProductId, id))
      .orderBy(asc(tyreImages.createdAt));

    const images = await Promise.all(
      rawImages.map(async (img) => ({
        id:             img.id,
        url:            await presignedUrl(img.imageUrl, 3600),
        imageType:      img.imageType,
        isPrimaryImage: img.isPrimaryImage,
      }))
    );

    return NextResponse.json(
      { ok: true, data: { ...row, images } },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[web/products] GET detail failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch product.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
