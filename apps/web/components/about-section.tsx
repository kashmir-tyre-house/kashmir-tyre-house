import Image from "next/image";
import { Karla, Raleway } from "next/font/google";

const karla = Karla({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const galleryImages = [
  {
    src: "/images/home-image-1.png",
    alt: "Heavy-duty vehicle tyre at an industrial work site",
  },
  {
    src: "/images/home-image-2.png",
    alt: "Commercial vehicle tyre service environment",
  },
  {
    src: "/images/home-image-3.png",
    alt: "Industrial vehicle prepared for demanding road conditions",
  },
  {
    src: "/images/home-image-4.png",
    alt: "Tyre support for construction and fleet applications",
  },
  {
    src: "/images/home-image-5.png",
    alt: "Heavy-duty tyre solution for rugged terrain",
  },
];

const aboutStats = [
  { num: "25+", label: "Experience" },
  { num: "250+", label: "SKUs in stock" },
  { num: "500+", label: "Customers served" },
];

function GalleryRow({
  direction,
  images,
}: {
  direction: "left" | "right";
  images: typeof galleryImages;
}) {
  return (
    <div className="about-marquee h-45 w-full overflow-hidden sm:h-55">
      <div
        className={`about-marquee__track about-marquee__track--${direction} flex h-full gap-4 sm:gap-5`}
      >
        {[...images, ...images, ...images].map((image, index) => (
          <div
            className="group relative h-45 w-72.5 shrink-0 overflow-hidden rounded-[22px] sm:h-55 sm:w-95"
            key={`${image.alt}-${index}`}
          >
            <Image
              alt={image.alt}
              className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              fill
              sizes="(min-width: 640px) 380px, 290px"
              src={image.src}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,26,18,0.02)_35%,rgba(35,26,18,0.42)_100%)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className={`${karla.className} max-w-330 mx-auto overflow-hidden text-[#231a12]`}
      id="about"
    >
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2
          className={`${raleway.className} mt-3 text-[30px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px]`}
          id="about-heading"
        >
          About Us
        </h2>
      </div>

      <div className="mx-auto grid gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
        <div className="lg:pt-1">
          <h2
            className={`${raleway.className} max-w-2xl font-semibold leading-[1.03] tracking-[-0.055em] text-[#231a12] lg:text-[54px]`}
          >
            Over two decades of keeping Kashmir moving.
          </h2>
        </div>

        <div>
          <p className="max-w-3xl text-[16px] font-medium leading-[1.8] text-[#6f6258] sm:text-[18px]">
            Kashmir Tyre House began as a single workshop and has grown into one
            of the region&apos;s trusted names in tyre sales and service. We
            work with leading brands to offer reliable tyres for trucks,
            industrial vehicles, construction equipment, and demanding road
            conditions.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-8 border-t border-[#231a12]/10 pt-6">
            {aboutStats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div className="flex flex-col gap-1">
                  <span className={`${raleway.className} text-[30px] font-bold leading-none tracking-[0.02em] text-[#231a12]`}>
                    {stat.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a5100]/70">
                    {stat.label}
                  </span>
                </div>
                {index < aboutStats.length - 1 && (
                  <div className="hidden h-10 w-px bg-[#231a12]/10 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-14 space-y-4 sm:mt-16">
        <div className="pointer-events-none absolute bottom-[-20px] left-0 top-[-20px] z-10 w-24 bg-[linear-gradient(90deg,#f9eee4,rgba(249,238,228,0))] sm:w-52" />
        <div className="pointer-events-none absolute bottom-[-20px] right-0 top-[-20px] z-10 w-24 bg-[linear-gradient(270deg,#f9eee4,rgba(249,238,228,0))] sm:w-52" />

        <GalleryRow direction="left" images={galleryImages} />
        <GalleryRow direction="right" images={galleryImages} />
      </div>
    </section>
  );
}
