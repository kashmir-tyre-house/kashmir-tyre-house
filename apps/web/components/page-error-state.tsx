"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Raleway } from "next/font/google";
import { useEffect } from "react";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

type PageErrorStateProps = {
  /** Short, human headline — no stack traces, no internal wording. */
  title: string;
  /** One or two sentences telling the user what they can do next. */
  description: string;
  /** Where the error came from, used only for the console log. */
  scope: string;
  error: Error & { digest?: string };
  /** Re-runs the failed render. Provided by the Next.js error boundary. */
  reset: () => void;
  /** Optional secondary action, e.g. back to the catalogue. */
  secondaryAction?: { href: string; label: string };
};

export function PageErrorState({
  title,
  description,
  scope,
  error,
  reset,
  secondaryAction,
}: PageErrorStateProps) {
  // Surface the real cause to the console for debugging; the UI deliberately
  // shows only the friendly copy so internals never leak to the user.
  useEffect(() => {
    console.error(`[${scope}] render failed`, error);
  }, [scope, error]);

  return (
    <section
      aria-live="polite"
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center sm:py-20"
      role="alert"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-[#c8922a]/35 bg-[#c8922a]/10 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#a8762a] uppercase">
        Something went wrong
      </span>

      <span className="mt-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f69300]/30 bg-[#f69300]/10 text-[#d47d00]">
        <TriangleAlert aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
      </span>

      <h1
        className={`${raleway.className} mt-6 text-[22px] font-medium tracking-[-0.03em] text-[#231a12] sm:text-[26px]`}
      >
        {title}
      </h1>

      <p className="mt-3 max-w-sm text-[13.5px] leading-[1.75] text-[#6f6258] sm:text-[14px] sm:leading-[1.8]">
        {description}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          className="group/cta relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] px-5 text-[13px] font-bold text-[#231a12] shadow-[0_10px_24px_rgba(246,147,0,0.26)] transition-shadow duration-300 hover:shadow-[0_16px_34px_rgba(246,147,0,0.36)] sm:w-auto"
          onClick={reset}
          type="button"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,196,128,0.95),transparent_36%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)]"
          />
          <RotateCcw
            aria-hidden="true"
            className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-rotate-45"
            strokeWidth={2.5}
          />
          <span className="relative">Try again</span>
        </button>

        {secondaryAction ? (
          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-[10px] border border-[#231a12]/15 bg-white/60 px-5 text-[13px] font-semibold text-[#231a12] no-underline transition-colors duration-300 hover:border-[#231a12]/30 hover:bg-white sm:w-auto"
            href={secondaryAction.href}
          >
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>

      {/* Digest helps correlate a user report with server logs. Harmless to
          show — it is an opaque hash, not the error message. */}
      {error.digest ? (
        <p className="mt-7 text-[11px] tracking-[0.08em] text-[#9a8d82]">
          Reference: {error.digest}
        </p>
      ) : null}
    </section>
  );
}
