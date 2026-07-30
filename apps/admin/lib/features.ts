import { getFeatureFlags, type FeatureName } from "@kth/config";

/**
 * Admin route prefixes and the module that owns each one.
 *
 * Order matters: the first enabled entry is where "/" lands after login. Keep it
 * in sync with the sidebar order in `components/admin-sidebar.tsx`.
 *
 * `/brands` is included even though it is currently commented out of the
 * sidebar — the page still exists and must not stay reachable by direct URL
 * once the module is switched off.
 */
export const ADMIN_ROUTES: ReadonlyArray<{
  href: string;
  feature: FeatureName;
}> = [
  { href: "/tyres", feature: "products" },
  { href: "/gallery-upload", feature: "gallery" },
  { href: "/enquiries", feature: "enquiries" },
  { href: "/brands", feature: "brands" }
];

/** Landing path for "/" — the first module that is switched on. */
export function firstEnabledAdminPath(): string {
  const flags = getFeatureFlags();
  const route = ADMIN_ROUTES.find((entry) => flags[entry.feature]);

  // `@kth/config` refuses to boot with every admin module disabled, so this
  // fallback should be unreachable.
  return route?.href ?? "/login";
}
