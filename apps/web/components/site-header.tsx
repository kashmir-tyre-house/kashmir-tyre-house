"use client";

import { Bookmark, ChevronDown, LayoutGrid, Scale, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCompare } from "../lib/compare";
import { StarBorder } from "./StarBorder";

const navItems = ["Home", "Brand", "Tyres", "Services", "About"];

export function SiteHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { compare, hydrated: compareHydrated } = useCompare();
  const compareCount = compareHydrated ? compare.length : 0;
  const [activeTarget, setActiveTarget] = useState(
    pathname === "/bookmarks"
      ? "bookmarks"
      : pathname === "/contact"
        ? "contact"
        : "home"
  );
  const currentActiveTarget = isHomePage
    ? activeTarget
    : pathname === "/bookmarks"
      ? "bookmarks"
      : pathname === "/contact"
        ? "contact"
      : "home";
  const [isHidden, setIsHidden] = useState(false);
  const [isDarkGlass, setIsDarkGlass] = useState(!isHomePage);
  const previousScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    previousScrollY.current = window.scrollY;
    const sectionIds = ["home", "tyres", "services", "about", "brand"];

    function updateActiveTarget() {
      const marker = window.scrollY + 180;
      let currentTarget = "home";

      for (const sectionId of sectionIds) {
        const section = document.getElementById(sectionId);

        if (section && marker >= section.offsetTop) {
          currentTarget = sectionId;
        }
      }

      setActiveTarget(currentTarget);
    }

    function updateHeader() {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - previousScrollY.current;
      const hero = document.getElementById("home");
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;

      setIsDarkGlass(
        !isHomePage || (heroBottom > 0 && currentScrollY + 160 >= heroBottom)
      );

      // Always show navbar near top
      if (currentScrollY < 40) {
        setIsHidden(false);
        setIsDarkGlass(!isHomePage);
        setActiveTarget("home");
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

      updateActiveTarget();
      ticking.current = false;
    }

    function handleScroll() {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    }

    updateHeader();
    updateActiveTarget();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("hashchange", updateActiveTarget);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("hashchange", updateActiveTarget);
    };
  }, [isHomePage, pathname]);

  return (
    <header
      onFocus={() => setIsHidden(false)}
      className={[
        "fixed left-0 right-0 top-4 z-50 px-5 ",
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:transition-none",
        isHidden
          ? "pointer-events-none translate-y-[-130%] opacity-0 blur-sm"
          : "translate-y-0 opacity-100 blur-0",
      ].join(" ")}
    >
      <nav
        aria-label="Primary navigation"
        className={[
          "mx-auto flex h-12.5 max-w-350 items-center justify-between",
          "rounded-full border px-2 backdrop-blur-md",
          "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDarkGlass
            ? "border-[#ffeee0]/12 bg-[#564b41b6]/82 shadow-[0_12px_42px_rgba(0,0,0,0.52)]"
            : "border-white/8 bg-[#4537273d]/55 shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          isHidden ? "scale-[0.98]" : "scale-100",
        ].join(" ")}
      >
        <Link
          href="/"
          aria-label="Kashmir Tyre House Home"
        >
          <div className="relative h-[38px] w-24 ml-[-2px] overflow-hidden rounded-full border border-[#f8ab59]/30 bg-[#fff8f5] px-3 shadow-[0_8px_22px_rgba(35,26,18,0.16)]">
            <Image
              alt="Kashmir Tyre House logo"
              className="object-contain scale-110 mt-0.5"
              fill
              priority
              sizes="160px"
              src="/logo/kthpl-tyre-logo-2.png"
            />
          </div>
        </Link>

        <ul className="absolute left-1/2 top-1/2 m-0 hidden -translate-x-1/2 -translate-y-1/2 list-none items-center gap-0 p-0 lg:flex">
          {navItems.map((item) => {
            const isActive = currentActiveTarget === item.toLowerCase();

            if (item === "Tyres") {
              return (
                <li key={item} className="group relative">
                  <button
                    type="button"
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-5 py-2 text-[14px] transition-colors duration-300",
                      isActive
                        ? "text-[#f8ab59]"
                        : "text-white/55 group-hover:text-white",
                    ].join(" ")}
                  >
                    Tyres
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180"
                      strokeWidth={2}
                    />
                  </button>

                  {/* Hover bridge + dropdown */}
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="relative w-66 overflow-hidden rounded-2xl border border-[#ffeee0]/12 bg-[#2a2017]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-6 top-3 h-px bg-linear-to-r from-transparent via-[#f8ab59]/50 to-transparent"
                      />
                      <Link
                        href={isHomePage ? "#tyres" : "/#tyres"}
                        className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline transition-colors duration-200 hover:bg-white/5"
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f8ab59]/25 bg-[#f8ab59]/10 text-[#f8ab59]">
                          <Sparkles aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-[14px] font-semibold text-white">
                            Featured Products
                          </span>
                          <span className="text-[12px] text-white/45">
                            Our handpicked highlights
                          </span>
                        </span>
                      </Link>
                      <Link
                        href="/products"
                        className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline transition-colors duration-200 hover:bg-white/5"
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/80">
                          <LayoutGrid aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-[14px] font-semibold text-white">
                            All Products
                          </span>
                          <span className="text-[12px] text-white/45">
                            Browse the full inventory
                          </span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={item}>
                <Link
                  href={
                    isHomePage
                      ? `#${item.toLowerCase()}`
                      : `/#${item.toLowerCase()}`
                  }
                  className={[
                    "rounded-full px-5 py-2 text-[14px] no-underline transition-colors duration-300",
                    isActive
                      ? "text-[#f8ab59]"
                      : "text-white/55 hover:text-white",
                  ].join(" ")}
                >
                  {item}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center mr-[-2px]">
          <Link
            href="/bookmarks"
            className={[
              "inline-flex h-9 items-center gap-2 rounded-full px-2 text-[14px] no-underline transition-colors duration-300",
              pathname === "/bookmarks"
                ? "text-[#f8ab59]"
                : "text-white/55 hover:text-white",
            ].join(" ")}
          >
            <Bookmark aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Saved
          </Link>

          <StarBorder
            as={Link}
            href="/compare"
            className="compare-star scale-95"
            color="#f8ab59"
            speed="3s"
            thickness={1.5}
            aria-label="Compare tyres"
          >
            <Scale aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Compare
            {compareCount > 0 ? (
              <span
                aria-label={`${compareCount} in compare`}
                className="compare-count"
              >
                {compareCount}
              </span>
            ) : null}
          </StarBorder>

          <Link
            href="/contact"
            className={[
              "relative inline-flex h-9 items-center overflow-hidden rounded-full px-4 text-[13px] font-bold text-[#231a12] no-underline scale-95",
              "transition-[filter,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "hover:brightness-110",
              isDarkGlass
                ? "shadow-[0_10px_28px_rgba(138,81,0,0.16)] hover:shadow-[0_14px_34px_rgba(138,81,0,0.2)]"
                : "shadow-[0_10px_28px_rgba(246,147,0,0.24)] hover:shadow-[0_14px_34px_rgba(218,198,168,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isDarkGlass ? "opacity-0" : "opacity-100",
              ].join(" ")}
            />
            <span
              aria-hidden="true"
              className={[
                "absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(246,147,0,0.22),transparent_62%),radial-gradient(circle_at_86%_88%,rgba(138,81,0,0.09),transparent_62%),linear-gradient(145deg,#ffffff_0%,#fff8f5_52%,#f3e4d6_100%)] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isDarkGlass ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
            <span className="relative">Send Enquiry</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
