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
          <div className="mb-16 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1
                className={`${raleway.className} mt-5 text-[40px] font-medium leading-[0.94] tracking-[-0.04em] text-[#231a12] sm:text-[56px] lg:text-[72px]`}
              >
                <BlurText delay={80} text="Let's" />{" "}
                <em className="not-italic text-[#c07000]">
                  <BlurText delay={80} startDelay={200} text="talk." />
                </em>
              </h1>

              <Reveal delayMs={300}>
                <p className="mt-5 max-w-lg text-[15px] font-medium leading-[1.8] text-[#6f6258]">
                  Review your shortlisted products, fill in a few details, and
                  we&apos;ll come back as soon as possible.
                </p>
              </Reveal>
            </div>
          </div>

          {/* ── Main two-column grid ─────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
            <Reveal delayMs={80} distance="sm">
              <ContactSelectedProducts />
            </Reveal>

            {/* ── RIGHT: Enquiry Form ──────────────────────────── */}
            <Reveal delayMs={80} distance="sm">
              <section className="rounded-[24px] border border-[#ead9c9] bg-white p-7 shadow-[0_18px_46px_rgba(35,26,18,0.06)] sm:p-6">
                <Reveal delayMs={0} distance="sm">
                  <h2
                    className={`${raleway.className} text-[22px] font-semibold tracking-[-0.03em] text-[#231a12]`}
                  >
                    Your Details
                  </h2>
                  <p className="mt-2 text-[13px] leading-[1.75] text-[#6f6258]">
                    Share a few details and our team will get back with pricing,
                    availability, and technical guidance.
                  </p>
                </Reveal>

                <ContactForm />
              </section>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
