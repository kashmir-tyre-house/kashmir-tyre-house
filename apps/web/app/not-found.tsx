import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#12100e] px-5 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(246,147,0,0.10)_0%,transparent_70%)]" />

      <span className="inline-flex items-center gap-2 rounded-full border border-[#c8922a]/35 bg-[#c8922a]/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#c8922a] uppercase">
        Page unavailable
      </span>

      <h1 className="font-display mt-7 text-[64px] font-extrabold leading-[0.85] tracking-[0.01em] text-white sm:text-[88px]">
        404
      </h1>

      <p className="mt-5 max-w-md text-[14px] leading-[1.8] text-white/60 sm:text-[15px]">
        We couldn&apos;t find that page. It may have been moved, or the section
        you&apos;re looking for isn&apos;t available right now.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="group/cta relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-[10px] px-5 text-[13px] font-bold text-black no-underline shadow-[0_10px_24px_rgba(246,147,0,0.26)] transition-[box-shadow] duration-300 hover:shadow-[0_16px_34px_rgba(246,147,0,0.36)]"
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,196,128,0.95),transparent_36%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)]" />
          <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.45),transparent)] transition-transform duration-700 ease-out group-hover/cta:translate-x-full" />
          <span className="relative">Back to home</span>
        </Link>
      </div>
    </main>
  );
}
