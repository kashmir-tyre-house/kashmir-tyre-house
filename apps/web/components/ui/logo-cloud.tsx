import type { ComponentProps } from "react";

import { cn } from "@kth/ui/utils";

import { InfiniteSlider } from "./infinite-slider";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = ComponentProps<"div"> & {
  logos: Logo[];
  /** Lower = faster. Seconds for one full loop. */
  duration?: number;
  /** Loop duration while hovered (use a larger value to slow on hover). */
  durationOnHover?: number;
  gap?: number;
  /** Scroll direction of the row. */
  reverse?: boolean;
};

export function LogoCloud({
  className,
  logos,
  duration = 36,
  durationOnHover = 80,
  gap = 56,
  reverse = true,
  ...props
}: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className,
      )}
    >
      <InfiniteSlider duration={duration} durationOnHover={durationOnHover} gap={gap} reverse={reverse}>
        {logos.map((logo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={logo.alt}
            className="h-9 w-auto select-none object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 md:h-12"
            height={logo.height ?? undefined}
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width={logo.width ?? undefined}
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}
