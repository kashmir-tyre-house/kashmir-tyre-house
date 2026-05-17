import { aboutImages, getDb } from "@kth/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminRole, requireAdmin } from "../../../../../lib/auth";
import { deleteFromR2, keyFromStored } from "../../../../../lib/r2";

export const runtime = "nodejs";

const patchSchema = z.object({
  alt:       z.string().min(1).max(180).optional(),
  isActive:  z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ── PATCH /api/admin/gallery/[id] ─────────────────────────────────────────────

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ ok: false, message: "No fields to update." }, { status: 400 });
    }

    const db = getDb();
    const [updated] = await db
      .update(aboutImages)
      .set(parsed.data)
      .where(eq(aboutImages.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, message: "Image not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("[gallery] PATCH failed", error);
    return NextResponse.json({ ok: false, message: "Failed to update image." }, { status: 500 });
  }
}

// ── DELETE /api/admin/gallery/[id] ────────────────────────────────────────────

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const db = getDb();

    const [deleted] = await db
      .delete(aboutImages)
      .where(eq(aboutImages.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ ok: false, message: "Image not found." }, { status: 404 });
    }

    try {
      await deleteFromR2(keyFromStored(deleted.url));
    } catch (r2Err) {
      console.warn("[gallery] R2 delete failed (continuing):", r2Err);
    }

    return NextResponse.json({ ok: true, data: { id: deleted.id } });
  } catch (error) {
    console.error("[gallery] DELETE failed", error);
    return NextResponse.json({ ok: false, message: "Failed to delete image." }, { status: 500 });
  }
}
