import { ArrowUpRight, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { Raleway } from "next/font/google";

import { BlurText } from "./blur-text";
import { Reveal } from "./reveal";
import { Meteors } from "./ui/meteors";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

const brands = [
  {
    name: "Maxam",
    logo: "/images/maxam-logo.webp",
    url: "https://maxamtire.com/",
    focus: "OTR & Industrial",
    tags: ["Mining", "Construction", "Industrial"],
    description:
      "Heavy-duty tyre solutions engineered for mining, construction, and demanding industrial environments."
  },
  {
    name: "Michelin",
    logo: "/images/michelin-logo.png",
    url: "https://www.michelin.in/",
    focus: "Fleet & Commercial",
    tags: ["Fleet", "Long-life", "Commercial"],
    description:
      "Globally trusted performance, long-life compounds, and proven support for commercial fleet reliability."
  },
  {
    name: "Bridgestone",
    logo: "/images/bridgestone-logo.webp",
    url: "https://www.bridgestone.co.in/",
    focus: "Highway & Haulage",
    tags: ["Highway", "Haulage", "Utility"],
    description:
      "Premium mobility technology and dependable tread performance across highway, haulage, and utility use."
  }
];

export function BrandsSection() {
  return (
    <section
      aria-labelledby="brand-heading"
      className="relative mx-auto max-w-330 px-4 pb-8 pt-12 text-[#231a12] sm:px-6 sm:pt-24 lg:px-8"
      id="brand"
    >
      {/* Warm atmosphere behind the grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-44 -z-10 h-[440px] w-[860px] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(246,147,0,0.08),transparent_66%)] blur-[26px]"
      />

      <div className="mx-auto max-w-[1480px]">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-14">
          <h2
            className={`${raleway.className} text-[26px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[34px] lg:text-[40px]`}
            id="brand-heading"
          >
            <span className="text-[#9b8d82]">
              <BlurText text="The world's most" delay={160} />
            </span>
            <br />
            <span className="font-semibold text-[#231a12]">
              trusted tyre brands.
            </span>
          </h2>
          <Reveal delayMs={200}>
            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-[1.75] text-[#6f6258] sm:mt-5 sm:text-[15px] sm:leading-[1.8]">
              We work with established tyre manufacturers known for reliability,
              field-tested durability, and dependable support across industrial,
              fleet, and commercial applications.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {brands.map((brand, index) => (
            <Reveal className="h-full" delayMs={index * 90} distance="sm" key={brand.name}>
              <a
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit the ${brand.name} website`}
                className="block h-full no-underline"
              >
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#ead9c9] bg-white p-6 shadow-[0_18px_46px_rgba(35,26,18,0.06)] transition-[transform,border-color,box-shadow] duration-500 hover:border-[#f0b366] hover:shadow-[0_30px_64px_rgba(35,26,18,0.12)]">
                {/* Warm hover sheen */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_-5%,rgba(246,147,0,0.12),transparent_46%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* Ghost index */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 top-0.5 select-none font-display text-[76px] font-extrabold leading-none tracking-[-0.05em] text-[#231a12]/5 transition-colors duration-500 group-hover:text-[#f69300]/10"
                >
                  0{index + 1}
                </span>

                {/* Shooting-star trails — Michelin card only. Sits before the
                    content block so the positioned content paints above it. */}
                {brand.name === "Michelin" ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                  >
                    <Meteors number={18} />
                  </span>
                ) : null}

                <div className="relative flex h-full flex-col">
                  {/* Logo plinth */}
                  <div className="relative flex h-[124px] items-center justify-center overflow-hidden rounded-[16px] border border-[#f0dfd1] bg-[linear-gradient(180deg,#fffaf6_0%,#ffffff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-16px_30px_rgba(35,26,18,0.03)]">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_128%,rgba(246,147,0,0.09),transparent_58%)]"
                    />
                    <div className="relative h-24 w-40 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]">
                      <Image
                        alt={`${brand.name} logo`}
                        className="object-contain"
                        fill
                        sizes="160px"
                        src={brand.logo}
                      />
                    </div>
                  </div>

                  {/* Focus label + corner arrow */}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a85d00]">
                      {brand.focus}
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ead9c9] text-[#a85d00] transition-all duration-300 group-hover:border-[#f0b366] group-hover:bg-[#fff1de]">
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={2.2}
                      />
                    </span>
                  </div>

                  <h3 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-[#231a12]">
                    {brand.name}
                  </h3>

                  <p className="mt-2.5 text-[13.5px] leading-[1.7] text-[#6f6258]">
                    {brand.description}
                  </p>

                  {/* Application tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {brand.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#eaddce] bg-[#fdf6ee] px-2.5 py-1 text-[10.5px] font-semibold text-[#8a6d4e]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Authorised dealer seal */}
                  <div className="mt-4 flex items-center gap-2 border-t border-[#f0e6d8] pt-3">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#fff1de] text-[#a85d00]">
                      <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.02em] text-[#8b7a6c]">
                      Authorised Dealer
                    </span>
                  </div>
                </div>
              </article>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
