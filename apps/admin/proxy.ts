import { getFeatureFlags } from "@kth/config";
import { NextResponse } from "next/server";

import { auth } from "./auth";
import { ADMIN_ROUTES } from "./lib/features";

// No route matches this path, so rewriting to it makes Next.js render
// `app/not-found.tsx` with a 404 status while leaving the URL untouched.
const NOT_FOUND_PATH = "/module-disabled";

// Auth runs first (the `authorized` callback in ./auth), so this only sees
// requests that are already signed in. Hiding the sidebar entry is cosmetic —
// this is what stops a disabled module being opened by direct URL.
export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const flags = getFeatureFlags();

  const match = ADMIN_ROUTES.find(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  );

  if (match && !flags[match.feature]) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|login|forgot-password|_next/static|_next/image|favicon.ico|.*\\..*).*)"
  ]
};
