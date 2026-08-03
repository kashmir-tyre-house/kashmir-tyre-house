"use client";

import * as React from "react";

import { cn } from "@kth/ui/utils";

interface CircuitBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  opacity?: number;
  // Stroke/fill colour of the circuit lines. Defaults to the site's warm
  // accent rather than the upstream cyan `--primary`, so it sits on-brand.
  color?: string;
  // Seconds for one dash cycle. Lower = faster flow.
  speedSeconds?: number;
}

const TILE = 100;

// The circuit tiles are rendered as real <path>/<circle> elements (not an SVG
// <pattern>): paths inside <defs><pattern> are never repainted when their
// stroke-dashoffset animates, so the upstream dash-flow was invisible. Rendered
// paths animate reliably, so the dashes flow along the static traces. The grid
// is sized to the container via ResizeObserver so it always fills, no more.
export function CircuitBackground({
  children,
  className,
  animated = true,
  opacity = 0.15,
  color = "#c8922a",
  speedSeconds = 2.5,
  ...props
}: CircuitBackgroundProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      // Border-box size, so the grid covers the full card — contentRect would
      // exclude the card's padding and leave the edges/bottom uncovered.
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One extra row/column so the pattern reaches the far/bottom edges. Capped so
  // an oversized container can't explode the DOM.
  const cols = Math.min(Math.ceil(size.w / TILE) + 1, 60);
  const rows = Math.min(Math.ceil(size.h / TILE) + 1, 40);

  const tiles: React.ReactElement[] = [];
  if (size.w > 0) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push(
          <g key={`${r}-${c}`} transform={`translate(${c * TILE},${r * TILE})`}>
            {/* Dashed traces (these are the elements that flow) */}
            <path d="M0 50 H30 M70 50 H100" strokeDasharray="10 5" />
            <path d="M50 0 V30 M50 70 V100" strokeDasharray="10 5" />
            <path d="M30 50 L50 30 M50 70 L70 50" strokeDasharray="10 5" />
            {/* Static nodes */}
            <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" />
            <circle cx="0" cy="0" r="2" fill="currentColor" stroke="none" />
          </g>
        );
      }
    }
  }

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full blur-[1px]",
          animated && "animate-circuit"
        )}
        style={{
          opacity,
          color,
          // Consumed by the .animate-circuit keyframe in globals.css.
          ["--circuit-duration" as string]: `${speedSeconds}s`
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {tiles}
      </svg>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default CircuitBackground;
