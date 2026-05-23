import { aboutImages, getDb } from "@kth/db";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { keyFromStored, presignedUrl } from "../../../../lib/r2";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ── GET /api/web/gallery ──────────────────────────────────────────────────────
// Public gallery list — returns only active images, ordered by sortOrder.

export async function GET() {
  try {
    const db = getDb();

    const rows = await db
      .select({
        id:        aboutImages.id,
        url:       aboutImages.url,
        alt:       aboutImages.alt,
        sortOrder: aboutImages.sortOrder,
        createdAt: aboutImages.createdAt,
      })
      .from(aboutImages)
      .where(eq(aboutImages.isActive, true))
      .orderBy(asc(aboutImages.sortOrder), asc(aboutImages.createdAt));

    const data = await Promise.all(
      rows.map(async (row) => {
        try {
          const key = keyFromStored(row.url);
          return { ...row, url: await presignedUrl(key, 3600) };
        } catch {
          return row;
        }
      })
    );

    return NextResponse.json({ ok: true, data }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[web/gallery] GET failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch gallery images.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
