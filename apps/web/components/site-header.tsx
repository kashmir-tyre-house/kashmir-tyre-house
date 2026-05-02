"use client";

import { useEffect, useRef, useState } from "react";

const navItems = ["Home", "Tyres", "Services", "About", "Contact"];

export function SiteHeader() {
  const [isHidden, setIsHidden] = useState(false);
  const previousScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    previousScrollY.current = window.scrollY;

    function updateHeader() {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - previousScrollY.current;

      // Always show navbar near top
      if (currentScrollY < 40) {
        setIsHidden(false);
        previousScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      // Ignore tiny scroll movements
      if (Math.abs(scrollDifference) > 8) {
        // Scrolling down = hide navbar
        // Scrolling up = show navbar
        setIsHidden(scrollDifference > 0);
        previousScrollY.current = currentScrollY;
      }

      ticking.current = false;
    }

    function handleScroll() {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      onFocus={() => setIsHidden(false)}
      className={[
        "fixed left-0 right-0 top-4 z-50 px-5",
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:transition-none",
        isHidden
          ? "pointer-events-none -translate-y-[130%] opacity-0 blur-sm"
          : "translate-y-0 opacity-100 blur-0",
      ].join(" ")}
    >
      <nav
        aria-label="Primary navigation"
        className={[
          "mx-auto flex h-[50px] max-w-[1400px] items-center justify-between",
          "rounded-full border border-white/[0.08]",
          "bg-[#2d2d2c]/55 px-2",
          "shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          "backdrop-blur-2xl",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isHidden ? "scale-[0.98]" : "scale-100",
        ].join(" ")}
      >
        <a
          href="#home"
          className="-ml-1.5 flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full bg-[#1e1e1c] text-[15px] font-black tracking-wide text-white no-underline"
          aria-label="Kashmir Tyre House Home"
        >
          K
        </a>

        <ul className="absolute left-1/2 top-1/2 m-0 hidden -translate-x-1/2 -translate-y-1/2 list-none items-center gap-0 p-0 lg:flex">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="rounded-full px-5 py-2 text-[14px] text-white/55 no-underline transition-colors duration-300 hover:text-white"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <a
            href="#contact"
            className="inline-flex h-[36px] items-center rounded-full bg-[#fff8f5] px-6 text-[13px] font-bold text-black no-underline transition-colors duration-300 hover:bg-[#fff8f5]/80"
          >
            Get Enquiry
          </a>
        </div>
      </nav>
    </header>
  );
}