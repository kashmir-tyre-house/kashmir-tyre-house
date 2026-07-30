"use client";

import type { FeatureFlags, FeatureName } from "@kth/config";
import { createContext, useContext } from "react";

// Flags are resolved on the server (see the root layout) and handed to client
// components through this provider. Client components must never read
// `process.env` for flags themselves — the server is the single source of truth,
// and the API enforces the same flags independently.

const FeatureFlagsContext = createContext<FeatureFlags | null>(null);

export function FeatureFlagsProvider({
  flags,
  children
}: {
  flags: FeatureFlags;
  children: React.ReactNode;
}) {
  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlags {
  const flags = useContext(FeatureFlagsContext);

  if (!flags) {
    throw new Error("useFeatureFlags must be used inside <FeatureFlagsProvider>.");
  }

  return flags;
}

export function useFeature(name: FeatureName): boolean {
  return useFeatureFlags()[name];
}
