import { enquiries, enquiryItems, getDb, tyreProducts } from "@kth/db";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { sendTemplateEmail } from "../../../../lib/email/service";
import { EnquiryEmail } from "../../../../lib/email/templates/enquiry-email";
import { checkRateLimit, getRequestIp } from "../../../../lib/rate-limit";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const enquirySchema = z.object({
  customerName: z.string().trim().min(1, "Name is required.").max(120),
  phone:        z.string().trim().min(5, "A valid phone number is required.").max(24),
  email:        z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().email("Invalid email address.").max(160).optional()
  ),
  companyName:  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(160).optional()
  ),
  message:      z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(2000).optional()
  ),
  productIds:   z.array(z.string().uuid()).max(20).optional().default([]),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ── POST /api/web/enquiries ───────────────────────────────────────────────────
// Public: accepts an enquiry submission. Stores it in `enquiries` /
// `enquiry_items` and emails the configured ENQUIRY_TO_EMAIL inbox.

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit({
    key: `web-enquiries:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many enquiries. Please try again later." },
      { status: 429, headers: { ...CORS_HEADERS, "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors },
      { status: 422, headers: CORS_HEADERS }
    );
  }

  const { customerName, phone, email, companyName, message, productIds } = parsed.data;

  try {
    const db = getDb();

    // Resolve products (must exist + be active). Surface a clear error rather
    // than letting the FK violation bubble up.
    const resolvedProducts = productIds.length > 0
      ? await db
          .select({
            id: tyreProducts.id,
            name: tyreProducts.name,
            tyreSize: tyreProducts.tyreSize,
            category: tyreProducts.category,
            pattern: tyreProducts.pattern,
          })
          .from(tyreProducts)
          .where(and(inArray(tyreProducts.id, productIds), eq(tyreProducts.isActive, true)))
      : [];

    if (resolvedProducts.length !== productIds.length) {
      return NextResponse.json(
        { ok: false, message: "One or more selected products are no longer available." },
        { status: 422, headers: CORS_HEADERS }
      );
    }

    const [created] = await db
      .insert(enquiries)
      .values({ customerName, phone, email, companyName, message })
      .returning();

    if (resolvedProducts.length > 0) {
      await db.insert(enquiryItems).values(
        resolvedProducts.map((p) => ({ enquiryId: created.id, tyreProductId: p.id }))
      );
    }

    // Email is best-effort — never fail the submission if it bounces. The
    // enquiry is already in the DB and admins can follow up via the portal.
    const to = process.env.ENQUIRY_TO_EMAIL;
    if (to) {
      try {
        await sendTemplateEmail({
          to,
          subject: `New enquiry from ${customerName}${companyName ? ` · ${companyName}` : ""}`,
          replyTo: email,
          template: EnquiryEmail,
          templateProps: {
            enquiryId: created.id,
            createdAt: created.createdAt,
            customerName,
            phone,
            email,
            companyName,
            message,
            products: resolvedProducts,
          },
        });
      } catch (emailError) {
        console.error("[web/enquiries] email send failed", emailError);
      }
    } else {
      console.warn("[web/enquiries] ENQUIRY_TO_EMAIL is not set — skipping email notification.");
    }

    return NextResponse.json(
      { ok: true, data: { id: created.id } },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[web/enquiries] POST failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to submit enquiry.",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
