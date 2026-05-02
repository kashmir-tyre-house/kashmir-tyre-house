"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroBackgroundRotatorProps = {
  alt: string;
  images: string[];
  intervalMs?: number;
};

export function HeroBackgroundRotator({
  alt,
  images,
  intervalMs = 7_500
}: HeroBackgroundRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-30">
      {images.map((image, index) => (
        <Image
          alt={index === 0 ? alt : ""}
          className={
            index === activeIndex
              ? "object-cover object-center opacity-100 transition-opacity duration-1000 ease-out"
              : "object-cover object-center opacity-0 transition-opacity duration-1000 ease-out"
          }
          fill
          key={image}
          priority={index === 0}
          quality={92}
          sizes="100vw"
          src={image}
        />
      ))}
    </div>
  );
}
