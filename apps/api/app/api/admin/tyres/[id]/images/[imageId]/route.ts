import { getDb, tyreImages } from "@kth/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getAdminRole, requireAdmin } from "../../../../../../../lib/auth";
import { deleteFromR2 } from "../../../../../../../lib/r2";

export const runtime = "nodejs";

// ── PATCH /api/admin/tyres/[id]/images/[imageId] ──────────────────────────────
// Sets the given image as the primary image. Unsets `isPrimaryImage` on every
// other image of the same product so there's exactly one primary at any time.

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id, imageId } = await params;
    const body = (await request.json().catch(() => ({}))) as { isPrimaryImage?: boolean };

    if (body.isPrimaryImage !== true) {
      return NextResponse.json(
        { ok: false, message: "Only setting an image as primary is supported." },
        { status: 400 }
      );
    }

    const db = getDb();

    const [target] = await db
      .select({ id: tyreImages.id })
      .from(tyreImages)
      .where(and(eq(tyreImages.id, imageId), eq(tyreImages.tyreProductId, id)))
      .limit(1);

    if (!target) {
      return NextResponse.json({ ok: false, message: "Image not found." }, { status: 404 });
    }

    await db
      .update(tyreImages)
      .set({ isPrimaryImage: false, imageType: "gallery" })
      .where(eq(tyreImages.tyreProductId, id));

    await db
      .update(tyreImages)
      .set({ isPrimaryImage: true, imageType: "hero" })
      .where(eq(tyreImages.id, imageId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tyres/images] PATCH failed", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update primary image." },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/tyres/[id]/images/[imageId] ─────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id, imageId } = await params;
    const db = getDb();

    const [image] = await db
      .select({ id: tyreImages.id, imageUrl: tyreImages.imageUrl })
      .from(tyreImages)
      .where(and(eq(tyreImages.id, imageId), eq(tyreImages.tyreProductId, id)))
      .limit(1);

    if (!image) {
      return NextResponse.json({ ok: false, message: "Image not found." }, { status: 404 });
    }

    await deleteFromR2(image.imageUrl);

    await db
      .delete(tyreImages)
      .where(eq(tyreImages.id, imageId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tyres/images] DELETE failed", error);
    return NextResponse.json({ ok: false, message: "Failed to delete image." }, { status: 500 });
  }
}
