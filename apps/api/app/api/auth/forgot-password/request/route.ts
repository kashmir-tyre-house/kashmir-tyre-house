import { NextResponse } from "next/server";
import { z } from "zod";

import { EmailServiceError } from "../../../../../lib/email/service";
import { requestPasswordReset } from "../../../../../lib/password-reset";
import { checkRateLimit, getRequestIp } from "../../../../../lib/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase())
});

const GENERIC_RESPONSE = {
  ok: true,
  message: "If that admin email exists, a password reset code has been sent."
};

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const body = await request.json().catch(() => null);
  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid work email." },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit({
    key: `forgot-password:request:${ip}:${parsedBody.data.email}`,
    limit: 3,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many reset attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) }
      }
    );
  }

  try {
    await requestPasswordReset(parsedBody.data.email);
  } catch (error) {
    console.error("[forgot-password] Password reset request failed", error);

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { ok: false, message: getDevelopmentEmailErrorMessage(error) },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(GENERIC_RESPONSE);
}

function getDevelopmentEmailErrorMessage(error: unknown) {
  if (error instanceof EmailServiceError) {
    if (error.code === "EMAIL_CONFIG_MISSING") {
      return "Resend is not configured. Add RESEND_API_KEY to apps/api/.env.local and restart the API server.";
    }
    if (error.code === "EMAIL_SENDER_MISSING") {
      return "Email sender is not configured. Add EMAIL_FROM to apps/api/.env.local and restart the API server.";
    }
    return `Email could not be sent: ${error.message}`;
  }
  return "Password reset email could not be sent in development.";
}
