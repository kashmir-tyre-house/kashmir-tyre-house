import { brands, getDb, tyreProducts } from "@kth/db";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "../../../auth";

export const runtime = "nodejs";

// ── Shared constants ──────────────────────────────────────────────────────────

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

// ── Schemas ───────────────────────────────────────────────────────────────────

const listQuerySchema = z.object({
  search:      z.string().optional(),
  brandId:     z.string().uuid().optional(),
  category:    z.enum(["Radial", "Bais"]).optional(),
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
  category:     z.enum(["Radial", "Bais"]).nullable().optional(),
  pattern:      z.string().min(1).max(80),
  tyreSize:     z.string().min(1).max(40),
  tyreWeight:   z.number().positive().nullable().optional(),
  application:  z.string().min(1).max(80),
  vehicleType:  z.enum(VEHICLE_TYPES).nullable().optional(),
  tyreType:     z.string().max(80).nullable().optional(),
  starRating:   z.string().max(20).nullable().optional(),
  plyRating:    z.string().max(40).nullable().optional(),
  loadIndex:    z.string().max(80).nullable().optional(),
  tyreFeatures: z.array(z.string()).default([]),
  isActive:     z.boolean().default(true),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getAdminRole() {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role ?? null;
}

function requireAdmin(role: string | null) {
  if (role !== "admin") {
    return NextResponse.json(
      { ok: false, message: "Forbidden. Admin role required." },
      { status: 403 }
    );
  }
  return null;
}

// ── GET /api/tyres ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[tyres] GET list failed", error);
    return NextResponse.json({ ok: false, message: "Failed to fetch tyres." }, { status: 500 });
  }
}

// ── POST /api/tyres ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const role = await getAdminRole();
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const db = getDb();
    const [created] = await db
      .insert(tyreProducts)
      .values(parsed.data)
      .returning();

    return NextResponse.json({ ok: true, data: { id: created.id } }, { status: 201 });
  } catch (error) {
    console.error("[tyres] POST create failed", error);
    return NextResponse.json({ ok: false, message: "Failed to create tyre product." }, { status: 500 });
  }
}
