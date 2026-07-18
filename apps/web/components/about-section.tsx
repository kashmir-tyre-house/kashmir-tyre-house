"use client";

import Image from "next/image";
import { Karla, Raleway } from "next/font/google";
import { useEffect, useState } from "react";

import { BlurText } from "./blur-text";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type GalleryImage = { src: string; alt: string };

type ApiGalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

type ApiGalleryResponse = {
  ok: boolean;
  data?: ApiGalleryImage[];
  message?: string;
};

const aboutStats = [
  { value: 25, suffix: "+", label: "Experience" },
  { value: 250, suffix: "+", label: "SKUs in stock" },
  { value: 500, suffix: "+", label: "Customers served" },
];

function GalleryRow({
  direction,
  images,
}: {
  direction: "left" | "right";
  images: GalleryImage[];
}) {
  return (
    <div className="about-marquee h-32 w-full overflow-hidden sm:h-45 lg:h-55">
      <div
        className={`about-marquee__track about-marquee__track--${direction} flex h-full gap-3 sm:gap-4 lg:gap-5`}
      >
        {[...images, ...images, ...images].map((image, index) => (
          <div
            className="group relative h-32 w-52 shrink-0 overflow-hidden rounded-[16px] sm:h-45 sm:w-72.5 sm:rounded-[20px] lg:h-55 lg:w-95 lg:rounded-[22px]"
            key={`${image.alt}-${index}`}
          >
            <Image
              alt={image.alt}
              className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 290px, 208px"
              src={image.src}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,26,18,0.02)_35%,rgba(35,26,18,0.42)_100%)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Returns null while loading, or when the gallery is empty / the request failed.
// Returns an array only when we have at least one real image to show.
function useGalleryImages(): GalleryImage[] | null {
  const [images, setImages] = useState<GalleryImage[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/web/gallery`);
        const json = (await res.json()) as ApiGalleryResponse;
        if (cancelled) return;
        if (!res.ok || !json.ok || !Array.isArray(json.data) || json.data.length === 0) return;

        const next: GalleryImage[] = json.data
          .filter((img) => Boolean(img.url))
          .map((img) => ({ src: img.url, alt: img.alt ?? "Kashmir Tyre House" }));

        if (next.length > 0) setImages(next);
      } catch {
        // Stay null on failure — the gallery section will be hidden.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return images;
}

export function AboutSection() {
  const galleryImages = useGalleryImages();

  return (
    <section
      aria-labelledby="about-heading"
      className={`${karla.className} mx-auto max-w-330 overflow-hidden pt-12 text-[#231a12] sm:pt-24`}
      id="about"
    >
      <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
        <h2
          className={`${raleway.className} text-[26px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[34px] lg:text-[40px]`}
          id="about-heading"
        >
          <span className="text-[#9b8d82]">
            <BlurText text="Get to know more about" delay={160} />
          </span>
          <br />
          <span className="font-semibold text-[#231a12]">
            who we are.
          </span>
        </h2>
      </div>

      <div className="mx-auto grid gap-8 px-4 text-center sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8 lg:text-left">
        <div className="lg:pt-1">
          <h2
            className={`${raleway.className} mx-auto max-w-2xl text-[28px] font-semibold leading-[1.05] tracking-[-0.055em] text-[#231a12] sm:text-[42px] sm:leading-[1.03] lg:mx-0 lg:text-[54px]`}
          >
            <BlurText text="Over two decades of marching forward." delay={80} />
          </h2>
        </div>

        <Reveal delayMs={90}>
          <p className="mx-auto max-w-3xl text-[15px] font-medium leading-[1.75] text-[#6f6258] sm:text-[18px] sm:leading-[1.8] lg:mx-0">
            Kashmir Tyre House began as a single workshop and has grown into one
            of the region&apos;s trusted names in tyre sales and service. We
            work with leading brands to offer reliable tyres for industrial,
            construction, mining, and earthmover equipment.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 border-t border-[#231a12]/10 pt-6 sm:gap-8 lg:justify-start">
            {aboutStats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-6 sm:gap-8">
                <div className="flex flex-col gap-1 text-center lg:text-left">
                  <CountUp
                    className={`${raleway.className} text-[30px] font-bold leading-none tracking-[0.02em] text-[#231a12]`}
                    suffix={stat.suffix}
                    to={stat.value}
                  />
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
        </Reveal>
      </div>

      {galleryImages && galleryImages.length > 0 ? (
        <Reveal className="relative mt-14 space-y-4 sm:mt-16" delayMs={140}>
          <div className="pointer-events-none absolute bottom-[-20px] left-0 top-[-20px] z-10 w-24 bg-[linear-gradient(90deg,#f9eee4,rgba(249,238,228,0))] sm:w-52" />
          <div className="pointer-events-none absolute bottom-[-20px] right-0 top-[-20px] z-10 w-24 bg-[linear-gradient(270deg,#f9eee4,rgba(249,238,228,0))] sm:w-52" />

          <GalleryRow direction="left" images={galleryImages} />
          <GalleryRow direction="right" images={galleryImages} />
        </Reveal>
      ) : null}
    </section>
  );
}
