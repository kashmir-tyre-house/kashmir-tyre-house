import Image from "next/image";
import { Raleway } from "next/font/google";

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
      className="px-4 pb-8 pt-24 text-[#231a12] sm:px-6 lg:px-8"
      id="brand"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2
            className={`${raleway.className} mt-5 text-[30px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px]`}
            id="brand-heading"
          >
            Trusted Brands
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.8] text-[#6f6258]">
            We work with established tyre manufacturers known for reliability,
            field-tested durability, and dependable support across industrial,
            fleet, and commercial applications.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {brands.map((brand) => (
            <article
              className="group relative overflow-hidden rounded-[24px] border border-[#ead9c9] bg-white p-6 shadow-[0_18px_46px_rgba(35,26,18,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-[#d8b997] hover:shadow-[0_24px_52px_rgba(35,26,18,0.08)]"
              key={brand.name}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(246,147,0,0.08),transparent_34%),linear-gradient(180deg,rgba(255,248,245,0.85)_0%,rgba(255,255,255,1)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex h-[112px] items-center justify-center rounded-[18px] border border-[#f0dfd1] bg-[#fffaf6] px-6">
                  <div className="relative h-28 w-40">
                    <Image
                      alt={`${brand.name} logo`}
                      src={brand.logo}
                      fill
                      className="object-contain"
                      sizes="160px"
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
          ))}
        </div>
      </div>
    </section>
  );
}
