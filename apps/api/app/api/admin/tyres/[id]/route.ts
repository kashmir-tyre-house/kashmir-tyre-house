import { brands, getDb, tyreImages, tyreProducts } from "@kth/db";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminRole, requireAdmin } from "../../../../../lib/auth";
import { presignedUrl } from "../../../../../lib/r2";

export const runtime = "nodejs";

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

const updateSchema = z.object({
  brandId:      z.string().uuid("Invalid brand ID.").optional(),
  name:         z.string().min(1).max(140).optional(),
  description:  z.string().max(2000).nullable().optional(),
  category:     z.enum(["Radial", "Bais", "Solid"]).nullable().optional(),
  pattern:      z.string().min(1).max(80).optional(),
  tyreSize:     z.string().min(1).max(40).optional(),
  tyreWeight:   z.number().positive().nullable().optional(),
  application:  z.string().min(1).max(80).optional(),
  vehicleType:  z.enum(VEHICLE_TYPES).nullable().optional(),
  tyreType:     z.string().max(80).nullable().optional(),
  starRating:   z.string().max(20).nullable().optional(),
  plyRating:    z.string().max(40).nullable().optional(),
  loadIndex:    z.string().max(80).nullable().optional(),
  rim:          z.string().max(80).nullable().optional(),
  treadDepth:   z.string().max(80).nullable().optional(),
  tyreFeatures: z.array(z.string()).optional(),
  isActive:     z.boolean().optional(),
});

function notFound() {
  return NextResponse.json({ ok: false, message: "Tyre product not found." }, { status: 404 });
}

// ── GET /api/admin/tyres/[id] ─────────────────────────────────────────────────

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
        rim:          tyreProducts.rim,
        treadDepth:   tyreProducts.treadDepth,
        tyreFeatures: tyreProducts.tyreFeatures,
        isActive:     tyreProducts.isActive,
        createdAt:    tyreProducts.createdAt,
        updatedAt:    tyreProducts.updatedAt,
        brand: {
          id:      brands.id,
          name:    brands.name,
          logoUrl: brands.logoUrl,
        },
      })
      .from(tyreProducts)
      .leftJoin(brands, eq(tyreProducts.brandId, brands.id))
      .where(eq(tyreProducts.id, id))
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

    return NextResponse.json({ ok: true, data: { ...row, images } });
  } catch (error) {
    console.error("[tyres] GET detail failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch tyre product.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}

// ── PUT /api/admin/tyres/[id] ─────────────────────────────────────────────────

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { ok: false, message: "No fields provided to update." },
        { status: 400 }
      );
    }

    const db = getDb();
    const [updated] = await db
      .update(tyreProducts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(tyreProducts.id, id))
      .returning();

    if (!updated) return notFound();

    return NextResponse.json({ ok: true, data: { id: updated.id } });
  } catch (error) {
    console.error("[tyres] PUT update failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update tyre product.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/tyres/[id] ──────────────────────────────────────────────

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const db = getDb();

    const [deleted] = await db
      .delete(tyreProducts)
      .where(eq(tyreProducts.id, id))
      .returning();

    if (!deleted) return notFound();

    return NextResponse.json({ ok: true, data: { id: deleted.id } });
  } catch (error) {
    console.error("[tyres] DELETE failed", error);
    return NextResponse.json({ ok: false, message: "Failed to delete tyre product." }, { status: 500 });
  }
}
