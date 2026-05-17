import { brands, getDb } from "@kth/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getAdminRole, requireAdmin } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const db = getDb();
    const rows = await db
      .select({ id: brands.id, name: brands.name, logoUrl: brands.logoUrl })
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(brands.name);

    return NextResponse.json({ ok: true, brands: rows });
  } catch (error) {
    console.error("[brands] Failed to fetch brands", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch brands.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}
