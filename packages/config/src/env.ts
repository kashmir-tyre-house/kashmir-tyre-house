import { z } from "zod";

import {
  ADMIN_FEATURES,
  FEATURE_NAMES,
  featureEnvKey,
  resolveDependencies,
  type FeatureFlags,
  type FeatureName
} from "./features";

const TRUE_VALUES = new Set(["true", "1", "on", "yes", "enabled"]);
const FALSE_VALUES = new Set(["false", "0", "off", "no", "disabled"]);

// Read every flag through a *static* `process.env.X` member access. Dynamic
// lookups (`process.env[key]`) are not inlined by the Next.js compiler, so they
// resolve to undefined in the Edge runtime used by middleware. Listing the keys
// explicitly keeps one implementation working in Node, Edge, and the browser.
function readRawEnv(): Record<FeatureName, string | undefined> {
  return {
    products: process.env.FEATURE_PRODUCTS,
    enquiries: process.env.FEATURE_ENQUIRIES,
    bookmarks: process.env.FEATURE_BOOKMARKS,
    compare: process.env.FEATURE_COMPARE,
    brands: process.env.FEATURE_BRANDS,
    gallery: process.env.FEATURE_GALLERY,
    services: process.env.FEATURE_SERVICES,
    about: process.env.FEATURE_ABOUT,
    customers: process.env.FEATURE_CUSTOMERS,
    claims: process.env.FEATURE_CLAIMS
  };
}

// An unset or empty variable means "enabled" so that existing deployments keep
// every module without adding env vars. Anything unrecognised is a hard error:
// a typo must fail the build loudly instead of silently enabling a module.
const flagSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim().toLowerCase() ?? "")
  .superRefine((value, ctx) => {
    if (value !== "" && !TRUE_VALUES.has(value) && !FALSE_VALUES.has(value)) {
      ctx.addIssue({
        code: "custom",
        message: `Expected one of ${[...TRUE_VALUES, ...FALSE_VALUES].join(", ")}.`
      });
    }
  })
  .transform((value) => !FALSE_VALUES.has(value));

const featureEnvSchema = z.object(
  Object.fromEntries(FEATURE_NAMES.map((name) => [name, flagSchema])) as Record<
    FeatureName,
    typeof flagSchema
  >
);

export function parseFeatureFlags(
  raw: Record<FeatureName, string | undefined>
): FeatureFlags {
  const parsed = featureEnvSchema.safeParse(raw);

  if (!parsed.success) {
    const details = Object.entries(parsed.error.flatten().fieldErrors)
      .map(([name, errors]) => `  ${featureEnvKey(name as FeatureName)}: ${errors?.join(" ")}`)
      .join("\n");

    throw new Error(`Invalid feature flag configuration.\n${details}`);
  }

  const resolved = resolveDependencies(parsed.data as FeatureFlags);

  if (!ADMIN_FEATURES.some((name) => resolved[name])) {
    throw new Error(
      "Invalid feature flag configuration.\n  At least one admin module must stay enabled " +
        `(one of: ${ADMIN_FEATURES.map(featureEnvKey).join(", ")}). ` +
        "With all of them disabled the admin portal has no page to open after login."
    );
  }

  return resolved;
}

let cached: FeatureFlags | undefined;

/** Resolved flags for the current process. Parsed once, then memoised. */
export function getFeatureFlags(): FeatureFlags {
  cached ??= parseFeatureFlags(readRawEnv());
  return cached;
}

export function isFeatureEnabled(name: FeatureName): boolean {
  return getFeatureFlags()[name];
}
