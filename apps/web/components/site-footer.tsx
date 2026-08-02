"use client";

// Rendered inside both server and client pages. Flags therefore come from the
// context provider rather than `getFeatureFlags()` — non-public env vars are
// not available in the browser bundle, so reading them here would resolve every
// flag to "on" client-side and desync hydration.
import type { FeatureName } from "@kth/config";
import Image from "next/image";
import Link from "next/link";
import { Karla, Raleway, Big_Shoulders_Inline } from "next/font/google";

import { useFeatureFlags } from "../lib/features";
import { LineSidebar } from "./LineSidebar";

const karla = Karla({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

const big_shoulders = Big_Shoulders_Inline({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
});

const footerLinks: ReadonlyArray<{
  label: string;
  href: string;
  feature: FeatureName;
}> = [
  { label: "Tyres", href: "/#tyres", feature: "products" },
  { label: "Services", href: "/#services", feature: "services" },
  { label: "Saved", href: "/bookmarks", feature: "bookmarks" },
  { label: "Send Enquiry", href: "/contact", feature: "enquiries" }
];

const dealerBrands = ["Michelin", "Maxam", "Bridgestone"];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const flags = useFeatureFlags();
  const visibleLinks = footerLinks.filter((link) => flags[link.feature]);

  return (
    <footer
      id="contact"
      className={`${karla.className} px-4 pb-4 pt-10 text-[#fff8f5] sm:pt-16 mt-16`}
    >
      <div className="relative w-full overflow-hidden rounded-[28px] border border-[#dac2ad]/30 bg-[#2a1a14] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:px-7 lg:px-10 lg:py-8">
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(246,147,0,0.18),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(255,184,111,0.14),transparent_32%),linear-gradient(120deg,rgba(138,81,0,0.26),rgba(35,26,18,0.94)_52%,rgba(17,14,12,0.98))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#fff8f5]/20" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
        {/* Oversized ghost wordmark */}
        <div
          aria-hidden="true"
          className={`${big_shoulders.className} pointer-events-none absolute inset-x-0 bottom-[-0.16em] select-none whitespace-nowrap text-right font-display text-[15vw] font-extrabold leading-none tracking-[-0.05em] text-[#fff8f5]/[0.035] lg:text-[150px]`}
        >
          Kashmir Tyre House
        </div>

        <div className="relative">
          {/* ── CTA band ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5 border-b border-[#fff8f5]/10 pb-6 sm:pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f8ab59]/25 bg-[#f8ab59]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb86f]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f69300]" />
                Ready when you are
              </span>
              <h2
                className={`${raleway.className} mt-3 text-[23px] font-semibold leading-[1.06] tracking-[-0.03em] text-[#fff8f5] sm:text-[28px] lg:text-[32px]`}
              >
                Let&apos;s get the right{" "}
                <span className="text-[#ffb86f]">tyres rolling.</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {flags.enquiries ? (
              <Link
                href="/contact"
                className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,196,128,0.95),transparent_36%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-4 text-[12.5px] font-bold text-[#231a12] no-underline shadow-[0_12px_30px_rgba(246,147,0,0.3)] transition-[transform,filter,box-shadow] duration-300 hover:brightness-110 hover:shadow-[0_16px_38px_rgba(246,147,0,0.42)] sm:h-11 sm:px-5 sm:text-[13px]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.45),transparent)] transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <span className="relative">Send an Enquiry</span>
                <svg className="relative transition-transform duration-300 group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              ) : null}

              <a
                href="tel:+919977249965"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#fff8f5]/18 bg-[#fff8f5]/[0.04] px-4 text-[12.5px] font-semibold text-[#ffeee0]/85 no-underline backdrop-blur-sm transition-colors duration-300 hover:border-[#f8ab59]/45 hover:bg-[#fff8f5]/[0.08] hover:text-white sm:h-11 sm:px-5 sm:text-[13px]"
              >
                <svg className="h-4 w-4 text-[#f69300]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.91.33 1.79.63 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.15a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.63.63A2 2 0 0 1 22 16.92Z" />
                </svg>
                Call us
              </a>
            </div>
          </div>

          {/* ── Main grid ────────────────────────────────────────────── */}
          <div className="grid gap-7 border-b border-[#fff8f5]/10 py-7 sm:gap-8 sm:py-8 lg:grid-cols-[1.2fr_180px_360px] lg:gap-10">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-white no-underline"
              >
                <div className="relative mb-4 ml-[-2px] h-[38px] w-24 overflow-hidden rounded-full border border-[#f8ab59]/30 bg-[#fff8f5] px-3 shadow-[0_8px_22px_rgba(35,26,18,0.16)]">
                  <Image
                    alt="Kashmir Tyre House logo"
                    className="mt-0.5 object-contain scale-110"
                    fill
                    sizes="160px"
                    src="/logo/kthpl-tyre-logo-2.png"
                  />
                </div>
              </Link>

              <p className="max-w-md text-[13.5px] italic leading-[1.7] text-[#ffeee0]/58 sm:text-[14.5px]">
                Premium tyres for industrial vehicles, and heavy-duty
                applications. Backed by technical expertise, site support, and
                reliable product guidance.
              </p>

              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffeee0]/38">
                  Authorised Dealer
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {dealerBrands.map((brand) => (
                    <span
                      key={brand}
                      className="rounded-full border border-[#fff8f5]/12 bg-[#fff8f5]/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[#ffeee0]/72"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffeee0]/42">
                Explore
              </p>

              <LineSidebar
                className="mt-2"
                items={visibleLinks.map((link) => ({
                  label: link.label,
                  href: link.href
                }))}
                accentColor="#ffb86f"
                textColor="rgba(255,238,224,0.68)"
                markerColor="rgba(255,248,245,0.22)"
                selectOnClick={false}
                showIndex={false}
                markerLength={22}
                markerGap={10}
                itemGap={10}
                maxShift={9}
                proximityRadius={80}
                fontSize={0.875}
                smoothing={120}
              />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffeee0]/42">
                Get in touch
              </p>

              <div className="mt-4 flex flex-col gap-2.5">
                {/* Links through to the enquiry page when that module is on,
                    otherwise the address stays as plain text. */}
                {(() => {
                  const addressBody = (
                    <>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-[#fff8f5]/12 bg-[#fff8f5]/[0.05] text-[#f69300] transition-colors duration-300 group-hover:border-[#f8ab59]/40">
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      Raipur, Chhattisgarh, India
                    </>
                  );

                  return flags.enquiries ? (
                    <Link
                      className="group flex items-center gap-2.5 text-[14px] leading-snug text-[#ffeee0]/68 no-underline transition-colors hover:text-[#ffb86f]"
                      href="/contact"
                    >
                      {addressBody}
                    </Link>
                  ) : (
                    <p className="group flex items-center gap-2.5 text-[14px] leading-snug text-[#ffeee0]/68">
                      {addressBody}
                    </p>
                  );
                })()}

                <a
                  className="group flex items-center gap-2.5 text-[14px] leading-snug text-[#ffeee0]/68 no-underline transition-colors hover:text-[#ffb86f]"
                  href="tel:+919977249965"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-[#fff8f5]/12 bg-[#fff8f5]/[0.05] text-[#f69300] transition-colors duration-300 group-hover:border-[#f8ab59]/40">
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.91.33 1.79.63 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.15a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.63.63A2 2 0 0 1 22 16.92Z" />
                    </svg>
                  </span>
                  +91 99772 49965
                </a>

                <a
                  className="group flex items-center gap-2.5 break-all text-[14px] leading-snug text-[#ffeee0]/68 no-underline transition-colors hover:text-[#ffb86f]"
                  href="mailto:rishi@kashmirtyrehouse.com"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-[#fff8f5]/12 bg-[#fff8f5]/[0.05] text-[#f69300] transition-colors duration-300 group-hover:border-[#f8ab59]/40">
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  rishi@kashmirtyrehouse.com
                </a>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#ffeee0]/40">
              © {year} Kashmir Tyre House. Built for confident product enquiries.
            </p>

            <a
              href="#home"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ffeee0]/55 no-underline transition-colors hover:text-[#ffb86f]"
            >
              Back to top
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#fff8f5]/15 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#f8ab59]/45">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
