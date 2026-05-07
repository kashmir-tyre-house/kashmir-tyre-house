import { ArrowRight } from "lucide-react";
import { Raleway } from "next/font/google";

import { ContactSelectedProducts } from "../../components/contact-selected-products";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { productCatalog } from "../../lib/products";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

const selectedProducts = productCatalog.slice(0, 3);


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
                Let&apos;s 
                <em className="not-italic text-[#c07000]"> talk.</em>
              </h1>

              <p className="mt-5 max-w-lg text-[15px] font-medium leading-[1.8] text-[#6f6258]">
                Review your shortlisted products, fill in a few details, and
                we&apos;ll come back as soon as possible.
              </p>
            </div>
          </div>

          {/* ── Main two-column grid ─────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
            <ContactSelectedProducts initialProducts={selectedProducts} />

            {/* ── RIGHT: Enquiry Form ──────────────────────────── */}
            <section className="rounded-[24px] border border-[#ead9c9] bg-white p-7 shadow-[0_18px_46px_rgba(35,26,18,0.06)] sm:p-6">
              <h2 className={`${raleway.className} text-[22px] font-semibold tracking-[-0.03em] text-[#231a12]`}>
                Your Details 
              </h2>
              <p className="mt-2 text-[13px] leading-[1.75] text-[#6f6258]">
                Share a few details and our team will get back with pricing,
                availability, and technical guidance.
              </p>

              <form className="mt-8" action="#">

                {/* Row 1 */}
                <div className={`${raleway.className} grid gap-4 sm:grid-cols-2`}>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
                      Full Name <span className="text-[#f69300] text-[18px]">*</span>
                    </span>
                    <input
                      className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      placeholder="Enter your full name"
                      type="text"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
                      Contact Number <span className="text-[#f69300] text-[18px]">*</span>
                    </span>
                    <input
                      className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      placeholder="Enter your contact number"
                      type="tel"
                    />
                  </label>
                </div>

                {/* Row 2 */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
                      Email Address
                    </span>
                    <input
                      className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      placeholder="Enter your email address"
                      type="email"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
                      Company
                    </span>
                    <input
                      className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      placeholder="Enter your company name"
                      type="text"
                    />
                  </label>
                </div>


                {/* Message */}
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
                    Message
                  </span>
                  <textarea
                    className="min-h-[150px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 py-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)] resize-none"
                    placeholder="Quantity needed, delivery location, urgency, special requirements..."
                  />
                </label>

                {/* Footer row */}
                <div className="mt-7 flex flex-col gap-4 border-t border-[#f0dfd1] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-[12px] leading-[1.8] text-[#9b8d82]">
                    By submitting you agree to be contacted regarding your
                    enquiry. We do not share your data.
                  </p>

                  <button
                    className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-[14px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-semibold text-white shadow-[0_14px_34px_rgba(246,147,0,0.28)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_18px_40px_rgba(246,147,0,0.36)] whitespace-nowrap"
                    type="submit"
                  >
                    Send Enquiry
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
