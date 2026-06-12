import Image from "next/image";
import Link from "next/link";
import { Karla } from "next/font/google";

const karla = Karla({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

const footerLinks = [
  { label: "Tyres", href: "/#tyres" },
  { label: "Services", href: "/#services" },
  { label: "Saved", href: "/bookmarks" },
  { label: "Send Enquiry", href: "/contact" }
];

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className={`${karla.className} px-4 pb-4 pt-12 text-[#fff8f5] sm:pt-24`}
    >
      <div className="relative w-full overflow-hidden rounded-[28px] border border-[#dac2ad]/30 bg-[#2a1a14] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:px-8 lg:px-12 lg:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(246,147,0,0.18),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(255,184,111,0.14),transparent_32%),linear-gradient(120deg,rgba(138,81,0,0.26),rgba(35,26,18,0.94)_52%,rgba(17,14,12,0.98))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#fff8f5]/20" />

        <div className="relative">
          <div className="grid gap-8 border-b border-[#fff8f5]/10 pb-8 sm:gap-10 sm:pb-10 lg:grid-cols-[1.2fr_220px_360px] lg:gap-12">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-white no-underline"
              >
                <div className="relative mb-5 ml-[-2px] h-[42px] w-28 overflow-hidden rounded-full border border-[#f8ab59]/30 bg-[#fff8f5] px-3 shadow-[0_8px_22px_rgba(35,26,18,0.16)]">
                  <Image
                    alt="Kashmir Tyre House logo"
                    className="mt-0.5 object-contain scale-110"
                    fill
                    sizes="160px"
                    src="/logo/kthpl-tyre-logo-2.png"
                  />
                </div>
              </Link>

              <p className="max-w-2xl text-[15px] leading-[1.75] text-[#ffeee0]/58 sm:text-[16px] italic">
                Premium tyres for industrial vehicles, and heavy-duty
                applications. Backed by technical expertise, site support, and
                reliable product guidance.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffeee0]/42">
                Explore
              </p>

              <div className="mt-5 flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <Link
                    className="text-[15px] font-medium leading-none text-[#ffeee0]/68 no-underline transition-colors hover:text-[#ffb86f]"
                    href={link.href}
                    key={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffeee0]/42">
                Get in touch
              </p>

              <div className="mt-5 flex flex-col gap-4">
                <Link
                  className="flex items-center gap-3 text-[15px] leading-snug text-[#ffeee0]/68 no-underline transition-colors hover:text-[#ffb86f]"
                  href="/contact"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#f69300]">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  Raipur, Chhattisgarh, India
                </Link>

                <a
                  className="flex items-center gap-3 text-[15px] leading-snug text-[#ffeee0]/68 no-underline transition-colors hover:text-[#ffb86f]"
                  href="tel:+919977249965"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#f69300]">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.91.33 1.79.63 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.15a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.63.63A2 2 0 0 1 22 16.92Z" />
                    </svg>
                  </span>
                  +91 99772 49965
                </a>

                <a
                  className="flex items-center gap-3 break-all text-[15px] leading-snug text-[#ffeee0]/68 no-underline transition-colors hover:text-[#ffb86f]"
                  href="mailto:rishi@kashmirtyrehouse.com"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#f69300]">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  rishi@kashmirtyrehouse.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-5 text-[11px] text-[#ffeee0]/35 sm:flex-row sm:items-center sm:justify-between">
            <p>Kashmir Tyre House. Built for confident product enquiries.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
