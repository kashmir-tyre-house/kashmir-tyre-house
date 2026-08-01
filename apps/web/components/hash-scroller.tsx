"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Fixes cross-page hash links (e.g. footer "/#tyres" clicked from /bookmarks).
// On such a navigation Next scrolls to the hash target before the home page's
// async sections have laid out, so it lands at the top and never reaches the
// section. This scrolls to the target once it actually exists in the DOM.
//
// Same-page hash clicks (already on "/") keep working through Next's native
// handling — this effect only re-runs when the pathname itself changes.
export function HashScroller() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;

    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const attempt = () => {
      const el = document.getElementById(id);
      if (el) {
        // scroll-behavior: smooth is set globally, so this eases into place.
        el.scrollIntoView({ block: "start" });
        return;
      }
      // Retry while the section is still mounting (async content/hydration).
      if (attempts++ < 30) {
        timer = setTimeout(attempt, 100);
      }
    };

    // Defer one tick so the freshly navigated page can paint first.
    timer = setTimeout(attempt, 60);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
