import { isFeatureEnabled } from "@kth/config";
import {
  ArrowRight,
  Camera,
  ClipboardList,
  FileText,
  Search,
  ShieldCheck
} from "lucide-react";
import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlurText } from "../../components/blur-text";
import { Reveal } from "../../components/reveal";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Tyre Claims | Kashmir Tyre House",
  description:
    "Raise a tyre warranty claim online with your invoice and photographs, and track its progress with a unique claim number."
};

const steps = [
  {
    icon: ClipboardList,
    title: "Submit your claim",
    body: "Fill in your tyre and invoice details, describe the concern, and attach supporting photographs."
  },
  {
    icon: Search,
    title: "We review it",
    body: "Our team verifies the tyre, invoice and images, then forwards eligible claims to the brand."
  },
  {
    icon: ShieldCheck,
    title: "Track to resolution",
    body: "Follow every stage with your claim number until the brand confirms the outcome."
  }
];

const requirements = [
  {
    icon: FileText,
    title: "Purchase invoice",
    body: "Your original tyre purchase invoice number and date."
  },
  {
    icon: Camera,
    title: "7–10 photographs",
    body: "Clear photos of the tyre, the damage, the serial marking and the invoice."
  },
  {
    icon: ClipboardList,
    title: "Tyre details",
    body: "Brand, size and pattern, plus a short description of the issue."
  }
];

export default function ClaimsLandingPage() {
  if (!isFeatureEnabled("claims")) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f9eee4] text-[#231a12]">
      <SiteHeader />

      <section className="mx-auto max-w-330 px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          {/* ── Hero ─────────────────────────────────────────────── */}
          <div className="max-w-3xl">
            <h1
              className={`${raleway.className} mt-5 text-[clamp(2.125rem,8vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[#231a12]`}
            >
              <BlurText delay={80} text="File a tyre" />{" "}
              <em className="not-italic text-[#c07000]">
                <BlurText delay={80} startDelay={220} text="claim." />
              </em>
            </h1>

            <Reveal delayMs={300}>
              <p className="mt-5 max-w-xl text-[14px] font-medium leading-[1.75] text-[#6f6258] sm:text-[15px] sm:leading-[1.8]">
                Register a warranty claim online in a few minutes. Add your tyre
                and invoice details, attach photographs, and we&apos;ll guide it
                through to the brand — with a claim number you can track at any
                time.
              </p>
            </Reveal>

            <Reveal delayMs={380}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/claims/new"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)]"
                >
                  Raise a Claim
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </Link>

                <Link
                  href="/claims/track"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#231a12]/15 bg-white px-5 text-[13px] font-bold text-[#231a12] no-underline shadow-[0_2px_8px_rgba(35,26,18,0.04)] transition-colors duration-200 hover:border-[#a85d00] hover:bg-[#fff1e3] hover:text-[#a85d00]"
                >
                  <Search aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Track a Claim
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ── How it works ─────────────────────────────────────── */}
          <div className="mt-24">
            <Reveal>
              <h2
                className={`${raleway.className} text-[22px] font-semibold tracking-[-0.02em] text-[#231a12] sm:text-[26px]`}
              >
                How it works
              </h2>
            </Reveal>

            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal key={step.title} delayMs={index * 90} distance="sm">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#ead9c9] bg-white p-6 shadow-[0_10px_32px_rgba(35,26,18,0.05)] transition-[border-color,box-shadow] duration-300 hover:border-[#f0b366] hover:shadow-[0_18px_44px_rgba(35,26,18,0.1)]">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-1 top-1 select-none font-display text-[64px] font-extrabold leading-none tracking-[-0.05em] text-[#231a12]/[0.04]"
                    >
                      0{index + 1}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-[#f0dfd1] bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] text-[#a85d00]">
                      <step.icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <h3 className="mt-4 text-[16px] font-bold tracking-[-0.02em] text-[#231a12]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#6f6258]">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── What you'll need ─────────────────────────────────── */}
          <div className="mt-10">
            <Reveal>
              <div className="overflow-hidden rounded-[24px] border border-[#ead9c9] bg-[#fffbf7] shadow-[0_10px_32px_rgba(35,26,18,0.05)]">
                <div className="border-b border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] px-6 py-4 sm:px-8">
                  <h2
                    className={`${raleway.className} text-[18px] font-semibold tracking-[-0.02em] text-[#231a12]`}
                  >
                    What you&apos;ll need
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-[#6f6258]">
                    Keep these handy before you start — it takes just a few
                    minutes.
                  </p>
                </div>

                <div className="grid gap-px bg-[#ead9c9]/60 sm:grid-cols-3">
                  {requirements.map((item) => (
                    <div key={item.title} className="bg-[#fffbf7] p-6 sm:p-7">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#fff1de] text-[#a85d00]">
                        <item.icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
                      </div>
                      <h3 className="mt-4 text-[14px] font-bold tracking-[-0.01em] text-[#231a12]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-[12.5px] leading-[1.65] text-[#6f6258]">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Closing CTA ──────────────────────────────────────── */}
          <Reveal>
            <div className="mt-10 flex flex-col items-start gap-4 rounded-[20px] border border-[#ead9c9] bg-white p-6 shadow-[0_10px_32px_rgba(35,26,18,0.05)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className={`${raleway.className} text-[19px] font-semibold tracking-[-0.02em] text-[#231a12] sm:text-[21px]`}
                >
                  Ready to raise your claim?
                </h2>
                <p className="mt-1.5 text-[13px] leading-[1.65] text-[#6f6258]">
                  You&apos;ll get a claim number the moment you submit.
                </p>
              </div>
              <Link
                href="/claims/new"
                className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-6 text-[13px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)]"
              >
                Start a Claim
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
