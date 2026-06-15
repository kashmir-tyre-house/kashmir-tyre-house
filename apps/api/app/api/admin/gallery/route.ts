import { aboutImages, getDb } from "@kth/db";
import { asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getAdminRole, requireAdmin } from "../../../../lib/auth";
import { keyFromStored, presignedUrl, uploadToR2 } from "../../../../lib/r2";

export const runtime = "nodejs";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ── GET /api/admin/gallery ────────────────────────────────────────────────────

export async function GET(request: Request) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(aboutImages)
      .orderBy(asc(aboutImages.sortOrder), asc(aboutImages.createdAt));

    const data = await Promise.all(
      rows.map(async (row) => {
        try {
          const key = keyFromStored(row.url);
          const signedUrl = await presignedUrl(key, 3600);
          return { ...row, url: signedUrl };
        } catch {
          return row;
        }
      })
    );

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[gallery] GET failed", error);
    return NextResponse.json({ ok: false, message: "Failed to fetch gallery images." }, { status: 500 });
  }
}

// ── POST /api/admin/gallery ───────────────────────────────────────────────────

export async function POST(request: Request) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const db = getDb();

    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(aboutImages);

    if (count >= MAX_IMAGES) {
      return NextResponse.json(
        { ok: false, message: `Gallery is full. Maximum ${MAX_IMAGES} images allowed.` },
        { status: 422 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const alt = (formData.get("alt") as string | null)?.trim() || "";

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, message: "Invalid file type. Only JPEG, PNG, and WEBP are allowed." },
        { status: 422 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, message: "File too large. Maximum size is 3 MB." },
        { status: 422 }
      );
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const key = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const storedKey = await uploadToR2(buffer, key, file.type);

    const [created] = await db
      .insert(aboutImages)
      .values({ url: storedKey, alt: alt || file.name, sortOrder: count })
      .returning();

    const signedUrl = await presignedUrl(storedKey, 3600);
    return NextResponse.json({ ok: true, data: { ...created, url: signedUrl } }, { status: 201 });
  } catch (error) {
    console.error("[gallery] POST failed", error);
    const msg = error instanceof Error ? error.message : String(error);
    const isAccessDenied = msg.toLowerCase().includes("access denied") || msg.toLowerCase().includes("invalidaccesskeyid");
    return NextResponse.json(
      {
        ok: false,
        message: isAccessDenied
          ? "R2 access denied — check that your API token has Object Read & Write permissions for this bucket."
          : msg,
        ...(process.env.NODE_ENV === "development" && { error: msg }),
      },
      { status: 500 }
    );
  }
}

// ── PATCH /api/admin/gallery (reorder) ───────────────────────────────────────

export async function PATCH(request: Request) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const body = await request.json().catch(() => null);
    if (!Array.isArray(body)) {
      return NextResponse.json({ ok: false, message: "Expected an array of { id, sortOrder }." }, { status: 400 });
    }

    const db = getDb();
    await Promise.all(
      (body as { id: string; sortOrder: number }[]).map(({ id, sortOrder }) =>
        db
          .update(aboutImages)
          .set({ sortOrder })
          .where(sql`${aboutImages.id} = ${id}`)
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[gallery] PATCH reorder failed", error);
    return NextResponse.json({ ok: false, message: "Failed to reorder images." }, { status: 500 });
  }
}
