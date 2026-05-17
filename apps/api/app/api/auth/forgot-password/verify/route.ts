import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPasswordResetCode } from "../../../../../lib/password-reset";
import { checkRateLimit, getRequestIp } from "../../../../../lib/rate-limit";

export const runtime = "nodejs";

const verifySchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code.")
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const body = await request.json().catch(() => null);
  const parsedBody = verifySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { ok: false, message: "Enter the 6-digit verification code." },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit({
    key: `forgot-password:verify:${ip}:${parsedBody.data.email}`,
    limit: 8,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many verification attempts. Please request a new code." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) }
      }
    );
  }

  try {
    const result = await verifyPasswordResetCode(parsedBody.data.email, parsedBody.data.code);

    if (!result.ok || !result.resetToken) {
      return NextResponse.json(
        { ok: false, message: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, resetToken: result.resetToken });
  } catch (error) {
    console.error("Password reset code verification failed", error);
    return NextResponse.json(
      { ok: false, message: "Unable to verify the code right now." },
      { status: 500 }
    );
  }
}
