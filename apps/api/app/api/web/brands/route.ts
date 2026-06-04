import { brands, getDb } from "@kth/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({ id: brands.id, name: brands.name, logoUrl: brands.logoUrl })
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(brands.name);

    return NextResponse.json({ ok: true, brands: rows }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[web/brands] GET failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch brands.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
