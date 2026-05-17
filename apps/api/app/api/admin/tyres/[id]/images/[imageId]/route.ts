import { getDb, tyreImages } from "@kth/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getAdminRole, requireAdmin } from "../../../../../../../lib/auth";
import { deleteFromR2 } from "../../../../../../../lib/r2";

export const runtime = "nodejs";

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
