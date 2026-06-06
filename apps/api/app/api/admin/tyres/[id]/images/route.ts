import { getDb, tyreImages, tyreProducts } from "@kth/db";
import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getAdminRole, requireAdmin } from "../../../../../../lib/auth";
import { presignedUrl, uploadToR2 } from "../../../../../../lib/r2";

export const runtime = "nodejs";

const MAX_TYRE_IMAGES  = 10;
const MAX_IMAGE_SIZE   = 3 * 1024 * 1024;
const ALLOWED_TYPES    = ["image/jpeg", "image/png", "image/webp"];

// ── POST /api/admin/tyres/[id]/images ─────────────────────────────────────────

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getAdminRole(request);
  const forbidden = requireAdmin(role);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const db = getDb();

    const [product] = await db
      .select({ id: tyreProducts.id })
      .from(tyreProducts)
      .where(eq(tyreProducts.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ ok: false, message: "Tyre product not found." }, { status: 404 });
    }

    const [{ existing }] = await db
      .select({ existing: count() })
      .from(tyreImages)
      .where(eq(tyreImages.tyreProductId, id));

    const formData = await request.formData();
    const primaryIndex = Number(formData.get("primaryIndex") ?? 0);

    const imageFiles: File[] = [];
    for (let i = 0; i < MAX_TYRE_IMAGES; i++) {
      const file = formData.get(`image_${i}`);
      if (file instanceof File) imageFiles.push(file);
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ ok: false, message: "No images provided." }, { status: 400 });
    }

    if (Number(existing) + imageFiles.length > MAX_TYRE_IMAGES) {
      return NextResponse.json(
        { ok: false, message: `Cannot exceed ${MAX_TYRE_IMAGES} images per product.` },
        { status: 422 }
      );
    }

    for (const file of imageFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { ok: false, message: `Invalid file type: ${file.name}. Only JPEG, PNG, and WEBP are allowed.` },
          { status: 422 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { ok: false, message: `File too large: ${file.name}. Maximum 3 MB per image.` },
          { status: 422 }
        );
      }
    }

    const hasPrimary = Number(existing) > 0;

    const inserted = await Promise.all(
      imageFiles.map(async (file, index) => {
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const key = `tyres/${id}/${index}-${Date.now()}.${ext}`;
        const storedKey = await uploadToR2(Buffer.from(await file.arrayBuffer()), key, file.type);

        const isPrimary = !hasPrimary && index === primaryIndex;

        const [row] = await db
          .insert(tyreImages)
          .values({
            tyreProductId:  id,
            imageUrl:       storedKey,
            imageType:      isPrimary ? "hero" : "gallery",
            isPrimaryImage: isPrimary,
          })
          .returning();

        return {
          id:             row.id,
          url:            await presignedUrl(storedKey, 3600),
          imageType:      row.imageType,
          isPrimaryImage: row.isPrimaryImage,
        };
      })
    );

    return NextResponse.json({ ok: true, data: inserted }, { status: 201 });
  } catch (error) {
    console.error("[tyres/images] POST failed", error);
    return NextResponse.json({ ok: false, message: "Failed to upload images." }, { status: 500 });
  }
}
