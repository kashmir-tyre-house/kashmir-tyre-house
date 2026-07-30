import { isFeatureEnabled, type FeatureName } from "@kth/config";
import { NextResponse } from "next/server";

/**
 * Guards a route handler behind a feature module.
 *
 * Returns a 404 response when the module is switched off, or `null` when the
 * handler should continue. Mirrors the `requireAdmin` pattern in `./auth`.
 *
 * 404 rather than 403 on purpose — a disabled module should not advertise that
 * it exists. Client-side gating is cosmetic; this is the real enforcement,
 * since the API is a separate origin that accepts cross-origin requests.
 */
export function requireFeature(
  name: FeatureName,
  headers?: HeadersInit
): NextResponse | null {
  if (isFeatureEnabled(name)) {
    return null;
  }

  return NextResponse.json(
    { ok: false, message: "Not found." },
    { status: 404, ...(headers ? { headers } : {}) }
  );
}
