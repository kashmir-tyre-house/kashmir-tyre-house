import { Button } from "@kth/ui";

import { AboutSection } from "../components/about-section";
import { BrandsSection } from "../components/brands-section";
import { FeaturedSection } from "../components/featured-section";
import { HeroBackgroundRotator } from "../components/hero-background-rotator";
import { Reveal } from "../components/reveal";
import { ServicesSection } from "../components/services-section";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const specItems = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9h1M9 13h1M9 17h1M15 13h1M15 17h1" />
      </svg>
    ),
    label: "Kashmir Tyre House Pvt. Ltd.",
    value: "A leading heavy-duty tyre partner for industrial, mining, and earthmover operations.",
    badge: "KTHPL",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: "Authorised Brand Dealer",
    value: "Authorised dealer for Michelin, Maxam, and Bridgestone earthmover and industrial tyres.",
    badge: "Brands",
  },
];

const stats = [
  { num: "250+", label: "SKUs in stock" },
  { num: "25yr", label: "Experience" },
  { num: "500+", label: "Customers served" },
];

const heroImages = [
  "/images/home-image-1.png",
  "/images/home-image-2.png",
  "/images/home-image-3.png",
  "/images/home-image-4.png",
  "/images/home-image-5.png"
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white bg-[#f9eee4] ">

      <SiteHeader />

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative isolate flex min-h-screen flex-col justify-center px-8 pb-16 pt-[68px]"
      >
        <HeroBackgroundRotator
          alt="Heavy-duty industrial vehicle on rugged tyres at a work site"
          images={heroImages}
        />

        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(4,4,4,0.78)_0%,rgba(8,8,8,0.62)_40%,rgba(12,12,12,0.3)_70%,rgba(12,12,12,0.08)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_42%,rgba(0,0,0,0.42)_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_70%_at_80%_50%,rgba(180,120,30,0.08)_0%,transparent_65%)]" />

        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_360px]">

          {/* Left */}
          <Reveal className="flex flex-col" delayMs={40} distance="sm">
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c8922a]/35 bg-[#c8922a]/10 px-4 py-1.5 text-[10px] font-semibold  tracking-[0.14em] text-[#c8922a]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c8922a]" />
                Premium Supplier
              </span>
            </div>

            <h1 className="font-display text-[58px] font-extrabold  leading-[0.9] tracking-[0.01em] text-white sm:text-[72px] lg:text-[50px]">
              Find the<br />
              right{" "}
              <span className="text-[#c8922a]">tyre.</span>
              <br />
              <span style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.2)", color: "transparent" }}>
                Every time.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[15px] font-normal leading-[1.8] text-white/45">
              Kashmir Tyre House Private Limited is a leading authorised OTR tyre dealer in India, representing trusted brands like Bridgestone, Maxam, and Michelin for mining, construction, industrial, and earthmover applications across Central India.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#c8922a] px-5 text-[14px] font-bold text-black hover:bg-[#e0a830] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] shadow-[0_10px_28px_rgba(246,147,0,0.24)] transition-[filter,transform,box-shadow] duration-300 hover:brightness-110 hover:shadow-[0_14px_34px_rgba(218, 198, 168, 0.32),inset_0_1px_0_rgba(255,255,255,0.36)]"
                size="lg"
              >
                Explore Inventory
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Button>
              <Button
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/12 bg-transparent px-5 text-[13px] font-medium text-white/60 hover:border-[#c8922a]/40 hover:bg-[#000000]/05 hover:text-black"
                size="lg"
                variant="secondary"
              >
                View Catalogue
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-10 border-t border-white/[0.07] pt-8">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-10">
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-[30px] font-bold  leading-none tracking-[0.02em] text-white">
                      {s.num}
                    </span>
                    <span className="text-[11px] font-medium tracking-[0.14em] text-[#f9eee482]">
                      {s.label}
                    </span>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="h-10 w-px bg-white/[0.08]" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right — spec cards */}
          <Reveal
            className="hidden flex-col gap-3 rounded-[28px] border border-white/[0.08] bg-[#00000038]/55 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md lg:flex"
            delayMs={160}
          >
            {specItems.map((item, index) => (
              <Reveal
                className="group"
                delayMs={220 + index * 90}
                distance="sm"
                key={item.label}
              >
                <div className="flex cursor-default items-center gap-4 rounded-2xl border border-white/[0.10] bg-white/[0.06] p-5 transition-all duration-300 hover:border-[#c8922a]/35 hover:bg-[#c8922a]/[0.08] hover:shadow-[0_18px_34px_rgba(0,0,0,0.16)]">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#c8922a]/35 bg-[#c8922a]/15 text-[#c8922a] shadow-[0_0_28px_rgba(200,146,42,0.12)]">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-none tracking-[0.02em] text-white/95">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-[11px] font-normal tracking-[0.07em] text-white/50">
                      {item.value}
                    </p>
                  </div>
                  <span className="rounded-[6px] border border-[#c8922a]/35 bg-[#c8922a]/15 px-2.5 py-1 text-[10px] font-semibold  tracking-[0.07em] text-[#dca947]">
                    {item.badge}
                  </span>
                </div>
              </Reveal>
            ))}

            <div className="mt-2 border-t border-white/[0.10] px-2 pt-3">
              <p className="text-[11px] font-medium tracking-[0.14em] text-white/35 text-center">
                Trusted by fleets across the region
              </p>
            </div>
          </Reveal>
        </div>

        {/* Scroll hint */}
        <Reveal
          className="absolute bottom-8 left-8 flex items-center gap-3"
          delayMs={320}
          distance="sm"
        >
          <div className="relative h-px w-8 overflow-hidden bg-white/15">
            <div className="absolute inset-y-0 left-0 w-full animate-[scrollAnim_2s_ease-in-out_infinite] bg-[#c8922a]" />
          </div>
          <span className="text-[10px] font-medium  tracking-[0.18em] text-white/20">
            Scroll to explore
          </span>
        </Reveal>
      </section>

      <BrandsSection />

      {/* <FeaturedSection /> */}

      <ServicesSection />

      <AboutSection />

      <SiteFooter />
    </main>
  );
}
