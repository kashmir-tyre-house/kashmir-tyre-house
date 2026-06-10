import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AdminToken = {
  adminRole?: string;
};

export async function getAdminRole(request: Request): Promise<string | null> {
  try {
    // NextAuth v5 does NOT auto-detect HTTPS in getToken. Without an explicit
    // `secureCookie`, it defaults to `false` and reads `authjs.session-token`
    // — but the admin portal in production sets `__Secure-authjs.session-token`
    // (HTTPS prefix), so decode silently fails → 403 for valid sessions.
    // Derive from the incoming request URL so it works in dev (HTTP) and prod (HTTPS).
    const isHttps = new URL(request.url).protocol === "https:";

    const token = await getToken({
      req: request as NextRequest,
      secret: process.env.AUTH_SECRET ?? "kth-admin-local-development-secret",
      secureCookie: isHttps,
    }) as AdminToken | null;
    return token?.adminRole ?? null;
  } catch (error) {
    console.error("[auth.getAdminRole] failed", error);
    return null;
  }
}

export function requireAdmin(role: string | null) {
  if (role !== "admin") {
    return NextResponse.json(
      { ok: false, message: "Forbidden. Admin role required." },
      { status: 403 }
    );
  }
  return null;
}
