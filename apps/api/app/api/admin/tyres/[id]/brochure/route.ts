import { getDb, tyreProducts } from "@kth/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getAdminRole, requireAdmin } from "../../../../../../lib/auth";
import { deleteFromR2, uploadToR2 } from "../../../../../../lib/r2";

export const runtime = "nodejs";

const MAX_BROCHURE_SIZE = 2 * 1024 * 1024;
const ALLOWED_BROCHURE_TYPES = ["application/pdf"];

// ── POST /api/admin/tyres/[id]/brochure ───────────────────────────────────────
// Uploads (or replaces) the product brochure. Any existing brochure is removed
// from R2 first so we never orphan files.

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const db = getDb();

    const [product] = await db
      .select({ id: tyreProducts.id, brochureUrl: tyreProducts.brochureUrl })
      .from(tyreProducts)
      .where(eq(tyreProducts.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ ok: false, message: "Tyre product not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("brochure");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, message: "No brochure file provided." }, { status: 400 });
    }
    if (!ALLOWED_BROCHURE_TYPES.includes(file.type)) {
      return NextResponse.json({ ok: false, message: "Brochure must be a PDF file." }, { status: 422 });
    }
    if (file.size > MAX_BROCHURE_SIZE) {
      return NextResponse.json({ ok: false, message: "Brochure is too large. Maximum 2 MB." }, { status: 422 });
    }

    const key = `tyres/${id}/brochure-${Date.now()}.pdf`;
    await uploadToR2(Buffer.from(await file.arrayBuffer()), key, "application/pdf");

    // Remove the previous brochure after the new one is safely uploaded.
    if (product.brochureUrl && product.brochureUrl !== key) {
      try {
        await deleteFromR2(product.brochureUrl);
      } catch (err) {
        console.error("[tyres/brochure] failed to delete old brochure", err);
      }
    }

    const brochureName = file.name.slice(0, 200);
    await db
      .update(tyreProducts)
      .set({ brochureUrl: key, brochureName, updatedAt: new Date() })
      .where(eq(tyreProducts.id, id));

    return NextResponse.json({ ok: true, data: { brochureName } }, { status: 201 });
  } catch (error) {
    console.error("[tyres/brochure] POST failed", error);
    return NextResponse.json({ ok: false, message: "Failed to upload brochure." }, { status: 500 });
  }
}

// ── DELETE /api/admin/tyres/[id]/brochure ─────────────────────────────────────

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const db = getDb();

    const [product] = await db
      .select({ id: tyreProducts.id, brochureUrl: tyreProducts.brochureUrl })
      .from(tyreProducts)
      .where(eq(tyreProducts.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ ok: false, message: "Tyre product not found." }, { status: 404 });
    }

    if (product.brochureUrl) {
      try {
        await deleteFromR2(product.brochureUrl);
      } catch (err) {
        console.error("[tyres/brochure] failed to delete brochure from R2", err);
      }
    }

    await db
      .update(tyreProducts)
      .set({ brochureUrl: null, brochureName: null, updatedAt: new Date() })
      .where(eq(tyreProducts.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tyres/brochure] DELETE failed", error);
    return NextResponse.json({ ok: false, message: "Failed to delete brochure." }, { status: 500 });
  }
}
