import { getFeatureFlags, type FeatureName } from "@kth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route prefixes owned by a feature module. Hiding the navigation is cosmetic;
// this is what stops a bookmarked or shared URL from opening a page whose
// module has been switched off.
const GUARDED_ROUTES: ReadonlyArray<[prefix: string, feature: FeatureName]> = [
  ["/products", "products"],
  ["/bookmarks", "bookmarks"],
  ["/compare", "compare"],
  ["/contact", "enquiries"]
];

// No route matches this path, so rewriting to it makes Next.js render
// `app/not-found.tsx` with a 404 status while leaving the URL untouched.
const NOT_FOUND_PATH = "/module-disabled";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const flags = getFeatureFlags();

  const match = GUARDED_ROUTES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (match && !flags[match[1]]) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:path*", "/bookmarks/:path*", "/compare/:path*", "/contact/:path*"]
};
