import Image from "next/image";
import { Raleway } from "next/font/google";

import { BlurText } from "./blur-text";
import { Reveal } from "./reveal";

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
    description:
      "Heavy-duty tyre solutions engineered for mining, construction, and demanding industrial environments."
  },
  {
    name: "Michelin",
    logo: "/images/michelin-logo.png",
    size: 2500,
    description:
      "Globally trusted performance, long-life compounds, and proven support for commercial fleet reliability."
  },
  {
    name: "Bridgestone",
    logo: "/images/bridgestone-logo.webp",
    description:
      "Premium mobility technology and dependable tread performance across highway, haulage, and utility use."
  }
];

export function BrandsSection() {
  return (
    <section
      aria-labelledby="brand-heading"
      className="mx-auto max-w-330 px-4 pb-8 pt-12 text-[#231a12] sm:px-6 sm:pt-24 lg:px-8"
      id="brand"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
          <h2
            className={`${raleway.className} mt-5 text-[26px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[34px] lg:text-[40px]`}
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
            <Reveal delayMs={index * 70} distance="sm" key={brand.name}>
              <article
                className="group relative overflow-hidden rounded-[24px] border border-[#ead9c9] bg-white p-5 shadow-[0_18px_46px_rgba(35,26,18,0.06)] transition-[transform,border-color,box-shadow] duration-300 hover:border-[#d8b997] hover:shadow-[0_24px_52px_rgba(35,26,18,0.08)]"
              >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(246,147,0,0.08),transparent_34%),linear-gradient(180deg,rgba(255,248,245,0.85)_0%,rgba(255,255,255,1)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex h-[112px] items-center justify-center rounded-[12px] border border-[#f0dfd1] bg-[#fffaf6] px-6">
                    <div className="relative h-28 w-40">
                      <Image
                        alt={`${brand.name} logo`}
                        className="object-contain"
                        fill
                        sizes="160px"
                        src={brand.logo}
                      />
                    </div>
                  </div>

                  <h3 className="mt-5 text-[20px] font-bold tracking-[-0.03em] text-[#231a12]">
                    {brand.name}
                  </h3>

                  <p className="mt-3 text-[14px] leading-[1.75] text-[#6f6258]">
                    {brand.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
