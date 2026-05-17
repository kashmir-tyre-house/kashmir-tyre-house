import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AdminToken = {
  adminRole?: string;
};

export async function getAdminRole(request: Request): Promise<string | null> {
  try {
    const token = await getToken({
      req: request as NextRequest,
      secret: process.env.AUTH_SECRET ?? "kth-admin-local-development-secret",
    }) as AdminToken | null;
    return token?.adminRole ?? null;
  } catch {
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
