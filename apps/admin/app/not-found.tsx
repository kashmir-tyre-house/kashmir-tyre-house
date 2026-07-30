import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] text-[18px] font-bold text-[#07162d]">
        404
      </span>

      <h1 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-[#07162d]">
        This page isn&apos;t available
      </h1>

      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#6b7280]">
        The page you tried to open doesn&apos;t exist, or the module it belongs
        to has been switched off for this environment.
      </p>

      <Link
        className="mt-6 inline-flex h-10 items-center rounded-[10px] bg-[#07162d] px-4 text-[13px] font-medium text-white transition hover:bg-[#0f2445] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07162d]"
        href="/"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
