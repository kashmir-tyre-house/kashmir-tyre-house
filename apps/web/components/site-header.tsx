"use client";

import { Bookmark, ChevronDown, ChevronRight, LayoutGrid, Menu, Scale, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useCompare } from "../lib/compare";
import { GlassSurface } from "./GlassSurface";
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

  // Tyres dropdown — rendered in a portal so its glass backdrop-filter isn't
  // clipped by the navbar's own backdrop-filter (a nested backdrop-filter only
  // samples within its filtered ancestor's box, which kills the effect here).
  const [mounted, setMounted] = useState(false);
  const [tyresOpen, setTyresOpen] = useState(false);
  const [tyresMenuPos, setTyresMenuPos] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const tyresTriggerRef = useRef<HTMLLIElement>(null);
  const tyresCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile navigation menu.
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionHref = (id: string) => (isHomePage ? `#${id}` : `/#${id}`);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (tyresCloseTimer.current) {
        clearTimeout(tyresCloseTimer.current);
      }
    };
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function openTyres() {
    if (tyresCloseTimer.current) {
      clearTimeout(tyresCloseTimer.current);
    }
    const rect = tyresTriggerRef.current?.getBoundingClientRect();
    if (rect) {
      setTyresMenuPos({ left: rect.left + rect.width / 2, top: rect.bottom });
    }
    setTyresOpen(true);
  }

  function scheduleCloseTyres() {
    if (tyresCloseTimer.current) {
      clearTimeout(tyresCloseTimer.current);
    }
    tyresCloseTimer.current = setTimeout(() => setTyresOpen(false), 120);
  }

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
        "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:transition-none",
        // Slide off-screen with transform only — animating opacity or a blur
        // filter on this ancestor would disable the navbar's backdrop-filter
        // mid-transition, flashing un-frosted glass on re-appear.
        isHidden
          ? "pointer-events-none translate-y-[-160%]"
          : "translate-y-0",
      ].join(" ")}
    >
      <GlassSurface
        width="100%"
        height={50}
        borderRadius={9999}
        backgroundOpacity={isDarkGlass ? 0.42 : 0.28}
        saturation={1.4}
        blur={12}
        displace={4}
        className={[
          "glass-nav relative z-20 mx-auto max-w-350",
          "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDarkGlass
            ? "shadow-[0_12px_42px_rgba(0,0,0,0.52)]"
            : "shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          isHidden ? "scale-[0.98]" : "scale-100",
        ].join(" ")}
      >
      <nav
        aria-label="Primary navigation"
        className="flex h-full w-full items-center justify-between px-2"
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
                <li
                  key={item}
                  ref={tyresTriggerRef}
                  className="relative"
                  onMouseEnter={openTyres}
                  onMouseLeave={scheduleCloseTyres}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={tyresOpen}
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-4 py-2 text-[13px] transition-colors duration-300",
                      isActive || tyresOpen
                        ? "text-[#f8ab59]"
                        : "text-white/55 hover:text-white",
                    ].join(" ")}
                  >
                    Tyres
                    <ChevronDown
                      aria-hidden="true"
                      className={[
                        "h-3.5 w-3.5 transition-transform duration-300",
                        tyresOpen ? "rotate-180" : "",
                      ].join(" ")}
                      strokeWidth={2}
                    />
                  </button>
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
                    "rounded-full px-4 py-2 text-[13px] no-underline transition-colors duration-300",
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

        <div className="flex items-center gap-1 mr-[-2px]">
          <div className="hidden items-center lg:flex">
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
          </div>

          <Link
            href="/contact"
            className={[
              "relative hidden h-9 items-center overflow-hidden rounded-full px-4 text-[13px] font-bold text-[#231a12] no-underline scale-95 lg:inline-flex",
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

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors duration-300 hover:text-white lg:hidden"
          >
            {menuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </nav>
      </GlassSurface>

      {/* Mobile navigation menu */}
      <div className="lg:hidden">
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className={[
            "fixed inset-0 bg-black/50 transition-opacity duration-300",
            menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
        />

        <div
          role="menu"
          className={[
            "absolute left-5 right-5 top-[calc(100%+10px)] z-10 origin-top overflow-hidden rounded-[20px] border border-[#ffeee0]/12 bg-[#1a120c] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
            "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            menuOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "pointer-events-none invisible -translate-y-2 scale-[0.98] opacity-0",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(246,147,0,0.12),transparent_45%)]" />

          <nav className="relative flex flex-col gap-0.5" aria-label="Mobile navigation">
            {[
              { label: "Home", href: sectionHref("home") },
              { label: "Brand", href: sectionHref("brand") },
              { label: "All Tyres", href: "/products" },
              { label: "Featured Tyres", href: sectionHref("tyres") },
              { label: "Services", href: sectionHref("services") },
              { label: "About", href: sectionHref("about") },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-[12px] px-4 py-3 text-[14px] font-medium text-white/75 no-underline transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
                <ChevronRight aria-hidden="true" className="h-4 w-4 text-white/30" strokeWidth={2} />
              </Link>
            ))}

            <div className="my-1.5 h-px bg-white/10" />

            <Link
              href="/bookmarks"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-[12px] px-4 py-3 text-[14px] font-medium text-white/75 no-underline transition-colors hover:bg-white/5 hover:text-white"
            >
              <Bookmark aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              Saved
            </Link>
            <Link
              href="/compare"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-[12px] px-4 py-3 text-[14px] font-medium text-white/75 no-underline transition-colors hover:bg-white/5 hover:text-white"
            >
              <Scale aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              Compare
              {compareCount > 0 ? (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f8ab59] px-1.5 text-[11px] font-bold text-[#231a12]">
                  {compareCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-1.5 flex items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-4 py-3 text-[14px] font-bold text-[#231a12] no-underline shadow-[0_10px_28px_rgba(246,147,0,0.24)] transition-[filter] duration-300 hover:brightness-110"
            >
              Send Enquiry
            </Link>
          </nav>
        </div>
      </div>

      {mounted
        ? createPortal(
            <div
              style={{
                position: "fixed",
                left: tyresMenuPos?.left ?? 0,
                top: tyresMenuPos?.top ?? 0,
                // Reveal via transform + visibility only. Animating opacity here
                // would disable the panel's backdrop-filter mid-transition
                // (opacity < 1 creates an isolated group with no backdrop to
                // sample), causing a flash of un-frosted glass.
                transform: `translateX(-50%) translateY(${tyresOpen ? "0" : "-6px"})`,
                transition:
                  "transform 200ms cubic-bezier(0.22,1,0.36,1), visibility 200ms",
              }}
              onMouseEnter={openTyres}
              onMouseLeave={scheduleCloseTyres}
              className={[
                "z-60 pt-2.5",
                tyresOpen ? "visible" : "pointer-events-none invisible",
              ].join(" ")}
            >
              <GlassSurface
                width={248}
                height="auto"
                borderRadius={18}
                backgroundOpacity={0.5}
                saturation={1.4}
                blur={12}
                displace={4}
                className="glass-dropdown shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                <div className="flex w-full flex-col p-2">
                  <p className="px-2.5 pb-1.5 pt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Browse Tyres
                  </p>

                  <Link
                    href={isHomePage ? "#tyres" : "/#tyres"}
                    onClick={() => setTyresOpen(false)}
                    className="group/item flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 no-underline transition-colors duration-200 hover:bg-white/[0.07]"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#f8ab59]/25 bg-[#f8ab59]/10 text-[#f8ab59] transition-colors duration-200 group-hover/item:bg-[#f8ab59]/15">
                      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[12px] font-semibold leading-tight text-white/85 transition-colors duration-200 group-hover/item:text-white">
                        Featured Products
                      </span>
                      <span className="mt-0.5 text-[10px] leading-tight text-white/40">
                        Our hand-picked top picks
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="ml-auto h-3.5 w-3.5 shrink-0 -translate-x-1 text-white/25 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:text-[#f8ab59] group-hover/item:opacity-100"
                      strokeWidth={2}
                    />
                  </Link>

                  <Link
                    href="/products"
                    onClick={() => setTyresOpen(false)}
                    className="group/item flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 no-underline transition-colors duration-200 hover:bg-white/[0.07]"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-white/12 bg-white/5 text-white/80 transition-colors duration-200 group-hover/item:bg-white/10">
                      <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[12px] font-semibold leading-tight text-white/85 transition-colors duration-200 group-hover/item:text-white">
                        All Products
                      </span>
                      <span className="mt-0.5 text-[10px] leading-tight text-white/40">
                        Browse the full catalogue
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="ml-auto h-3.5 w-3.5 shrink-0 -translate-x-1 text-white/25 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:text-[#f8ab59] group-hover/item:opacity-100"
                      strokeWidth={2}
                    />
                  </Link>
                </div>
              </GlassSurface>
            </div>,
            document.body
          )
        : null}
    </header>
  );
}
