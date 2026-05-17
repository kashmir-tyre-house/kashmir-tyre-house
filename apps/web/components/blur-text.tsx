"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type BlurTextProps = {
  text: string;
  delay?: number;
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  className?: string;
};

export function BlurText({
  text,
  delay = 120,
  animateBy = "words",
  direction = "bottom",
  className = "",
}: BlurTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tokens = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <span ref={ref} aria-label={text} className={className}>
      {tokens.map((token, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: "inline-block",
            filter: inView ? "blur(0px)" : "blur(10px)",
            opacity: inView ? 1 : 0,
            transform: inView
              ? "translateY(0px)"
              : direction === "bottom"
              ? "translateY(8px)"
              : "translateY(-8px)",
            transition: `filter 0.65s cubic-bezier(0.22,1,0.36,1) ${i * delay}ms, opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${i * delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * delay}ms`,
            willChange: "filter, opacity, transform",
          } as CSSProperties}
        >
          {token}
          {animateBy === "words" && i < tokens.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
