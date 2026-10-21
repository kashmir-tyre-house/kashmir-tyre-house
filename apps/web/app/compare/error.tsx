"use client";

import { Karla } from "next/font/google";

import { PageErrorState } from "../../components/page-error-state";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

const karla = Karla({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

// Route-level boundary for /compare. Catches render-time failures that the
// page's own inline fetch-error state cannot — e.g. unreadable saved compare
// data in localStorage. Header and footer are kept so the user can navigate
// away instead of hitting a dead end.
export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className={`${karla.className} min-h-screen bg-[#f9eee4] text-[#231a12]`}
    >
      <SiteHeader />

      <PageErrorState
        description="We couldn't load your comparison just now. Try again, or head back to the catalogue and pick the tyres you want to compare."
        error={error}
        reset={reset}
        scope="compare"
        secondaryAction={{ href: "/products", label: "Browse tyres" }}
        title="Comparison couldn't be loaded"
      />

      <SiteFooter />
    </main>
  );
}
