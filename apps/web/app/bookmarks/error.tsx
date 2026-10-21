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

// Route-level boundary for /bookmarks (Saved). Catches render-time failures
// that the page's own inline fetch-error state cannot — e.g. unreadable saved
// bookmark data in localStorage.
export default function BookmarksError({
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
        description="We couldn't load your saved tyres just now. Your saved list is stored on this device and hasn't been lost — try again, or keep browsing the catalogue."
        error={error}
        reset={reset}
        scope="bookmarks"
        secondaryAction={{ href: "/products", label: "Browse tyres" }}
        title="Saved tyres couldn't be loaded"
      />

      <SiteFooter />
    </main>
  );
}
