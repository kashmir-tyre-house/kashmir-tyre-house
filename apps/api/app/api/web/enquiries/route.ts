import { enquiries, enquiryItems, getDb, tyreProducts } from "@kth/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { sendTemplateEmail } from "../../../../lib/email/service";
import { EnquiryEmail } from "../../../../lib/email/templates/enquiry-email";
import { checkRateLimit, getRequestIp } from "../../../../lib/rate-limit";

export const runtime = "nodejs";

// Hard cap: at most this many enquiries per IP address per calendar day (IST).
// Persisted in the DB so it survives serverless cold starts / multiple regions.
const DAILY_ENQUIRY_LIMIT = 2;

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

    // Prevent duplicate enquiries: the same email cannot enquire again about a
    // product it has already enquired about. Email is compared case-insensitively.
    if (email && productIds.length > 0) {
      const alreadyEnquired = await db
        .select({ productId: enquiryItems.tyreProductId })
        .from(enquiryItems)
        .innerJoin(enquiries, eq(enquiryItems.enquiryId, enquiries.id))
        .where(
          and(
            sql`lower(${enquiries.email}) = ${email.toLowerCase()}`,
            inArray(enquiryItems.tyreProductId, productIds)
          )
        );

      if (alreadyEnquired.length > 0) {
        const dupeCount = new Set(alreadyEnquired.map((r) => r.productId)).size;

        return NextResponse.json(
          {
            ok: false,
            message: `You've already enquired about ${dupeCount > 1 ? "these products" : "this product"} with this email.`,
          },
          { status: 409, headers: CORS_HEADERS }
        );
      }
    }

    // Per-IP daily hard limit — checked after the duplicate guard so a repeat
    // enquiry gets the duplicate message rather than this one. Counts this IP's
    // enquiries since midnight IST; skipped when the IP can't be determined.
    if (ip !== "unknown") {
      const [{ count }] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(enquiries)
        .where(
          and(
            eq(enquiries.ipAddress, ip),
            sql`${enquiries.createdAt} >= (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')`
          )
        );

      if (count >= DAILY_ENQUIRY_LIMIT) {
        return NextResponse.json(
          {
            ok: false,
            message: `Daily limit reached. Try again tomorrow or contact us.`,
          },
          { status: 429, headers: CORS_HEADERS }
        );
      }
    }

    const [created] = await db
      .insert(enquiries)
      .values({
        customerName,
        phone,
        email,
        companyName,
        message,
        ipAddress: ip === "unknown" ? null : ip,
      })
      .returning();

    if (resolvedProducts.length > 0) {
      await db.insert(enquiryItems).values(
        resolvedProducts.map((p) => ({ enquiryId: created.id, tyreProductId: p.id }))
      );
    }

    // Email is best-effort — never fail the submission if it bounces. The
    // enquiry is already in the DB and admins can follow up via the portal.
    const to = process.env.ENQUIRY_TO_EMAIL;
    // Optional comma-separated list of additional recipients to keep in the loop.
    const cc = (process.env.ENQUIRY_CC_EMAIL ?? "")
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean);
    if (to) {
      try {
        await sendTemplateEmail({
          to,
          ...(cc.length > 0 ? { cc } : {}),
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
