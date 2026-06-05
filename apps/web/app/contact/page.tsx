import { MessageCircle } from "lucide-react";
import { Raleway } from "next/font/google";

import { BlurText } from "../../components/blur-text";
import { ContactForm } from "../../components/contact-form";
import { ContactSelectedProducts } from "../../components/contact-selected-products";
import { Reveal } from "../../components/reveal";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f9eee4] text-[#231a12]">
      <SiteHeader />

      <section className="px-4 pb-28 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          {/* ── Page header ─────────────────────────────────────── */}
          <div className="mb-14 max-w-3xl">
            <h1
              className={`${raleway.className} mt-4 text-[40px] font-medium leading-[0.94] tracking-[-0.04em] text-[#231a12] sm:text-[56px] lg:text-[72px]`}
            >
              <BlurText delay={80} text="Let's" />{" "}
              <em className="not-italic text-[#c07000]">
                <BlurText delay={80} startDelay={200} text="talk." />
              </em>
            </h1>

            <Reveal delayMs={300}>
              <p className="mt-5 max-w-xl text-[15px] font-medium leading-[1.8] text-[#6f6258]">
                Review your shortlisted products, fill in a few details, and
                we&apos;ll come back as soon as possible.
              </p>
            </Reveal>
          </div>

          {/* ── Main two-column grid ─────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
            <Reveal delayMs={80} distance="sm">
              <ContactSelectedProducts />
            </Reveal>

            {/* ── RIGHT: Enquiry Form ──────────────────────────── */}
            <Reveal delayMs={80} distance="sm">
              <section className="overflow-hidden rounded-[20px] border border-[#ead9c9] bg-white shadow-[0_10px_32px_rgba(35,26,18,0.05)]">
                {/* Header strip — matches the selected-products card pattern */}
                <div className="flex items-center justify-between gap-3 border-b border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] px-6 py-4 sm:px-7">
                  <div>
                    <h2
                      className={`${raleway.className} text-[18px] font-semibold tracking-[-0.02em] text-[#231a12]`}
                    >
                      Your Details
                    </h2>
                    <p className="mt-1 text-[12.5px] leading-[1.6] text-[#6f6258]">
                      Pricing, availability, and technical guidance — At the earliest.
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a85d00] sm:inline-block">
                    * Required
                  </span>
                </div>

                <div className="px-6 pb-7 sm:px-7">
                  <ContactForm />
                </div>
              </section>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
