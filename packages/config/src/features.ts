// Feature module registry.
//
// Each module can be switched off from the environment without touching code:
// set `FEATURE_<NAME>=false` and redeploy. An unset variable means the module
// is ON, so existing deployments keep working with no env changes.

export const FEATURE_NAMES = [
  "products",
  "enquiries",
  "bookmarks",
  "compare",
  "brands",
  "gallery",
  "services",
  "about",
  "customers"
] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

export type FeatureFlags = Record<FeatureName, boolean>;

/**
 * Modules that cannot stand on their own. If a parent is disabled, the child is
 * resolved to disabled too — callers never have to re-derive this.
 */
export const FEATURE_DEPENDENCIES: Partial<Record<FeatureName, FeatureName>> = {
  bookmarks: "products",
  compare: "products"
};

/** Env variable name that controls a module, e.g. "products" -> FEATURE_PRODUCTS. */
export function featureEnvKey(name: FeatureName): string {
  return `FEATURE_${name.toUpperCase()}`;
}

/**
 * Admin modules. At least one must stay enabled, otherwise the admin portal has
 * no landing page to redirect to after login.
 */
export const ADMIN_FEATURES: readonly FeatureName[] = [
  "products",
  "gallery",
  "enquiries",
  "brands"
];

/**
 * Resolves declared dependencies: a module is only enabled if it is enabled
 * itself AND every ancestor it depends on is enabled.
 */
export function resolveDependencies(declared: FeatureFlags): FeatureFlags {
  const resolved = { ...declared };

  for (const name of FEATURE_NAMES) {
    let current: FeatureName | undefined = name;
    const seen = new Set<FeatureName>();

    while (current && !seen.has(current)) {
      seen.add(current);

      if (!declared[current]) {
        resolved[name] = false;
        break;
      }

      current = FEATURE_DEPENDENCIES[current];
    }
  }

  return resolved;
}
