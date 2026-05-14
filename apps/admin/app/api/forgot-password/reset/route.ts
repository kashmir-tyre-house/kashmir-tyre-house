import { NextResponse } from "next/server";
import { z } from "zod";

import { resetAdminPassword } from "../../../../lib/password-reset";
import { checkRateLimit, getRequestIp } from "../../../../lib/rate-limit";

export const runtime = "nodejs";

const resetSchema = z
  .object({
    email: z.string().trim().email().transform((email) => email.toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
    resetToken: z.string().min(32)
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const body = await request.json().catch(() => null);
  const parsedBody = resetSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        ok: false,
        message:
          parsedBody.error.issues[0]?.message ?? "Check your new password."
      },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit({
    key: `forgot-password:reset:${ip}:${parsedBody.data.email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many reset attempts. Please request a new code."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  try {
    const wasReset = await resetAdminPassword(parsedBody.data);

    if (!wasReset) {
      return NextResponse.json(
        { ok: false, message: "This reset session is invalid or expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Password reset successfully."
    });
  } catch (error) {
    console.error("Admin password reset failed", error);
    return NextResponse.json(
      { ok: false, message: "Unable to reset the password right now." },
      { status: 500 }
    );
  }
}
