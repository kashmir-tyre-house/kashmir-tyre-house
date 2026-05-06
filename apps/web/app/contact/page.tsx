import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Raleway } from "next/font/google";

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

            {/* ── LEFT: Selected Products ──────────────────────── */}
            <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-28">
              <div className="rounded-[24px] border border-[#ead9c9] bg-white p-6 shadow-[0_18px_46px_rgba(35,26,18,0.06)]">
                <div className="flex items-center justify-between">
                  <h2 className={`${raleway.className} text-[17px] font-semibold tracking-[-0.03em] text-[#231a12]`}>
                    Selected Products
                  </h2>
                  <span className="rounded-full bg-[#fff1de] px-2.5 py-1 text-[11px] font-semibold text-[#a06000]">
                    {selectedProducts.length} items
                  </span>
                </div>

                <ul className="mt-5 space-y-3">
                  {selectedProducts.map((product) => (
                    <li
                      className="group relative flex gap-3.5 rounded-[16px] border border-[#f0dfd1] bg-[#fffcfa] p-2 transition-shadow duration-300 hover:shadow-[0_6px_20px_rgba(35,26,18,0.06)]"
                      key={product.productName}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-[72px] w-[80px] shrink-0 overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_50%_45%,rgba(246,147,0,0.14),transparent_38%),linear-gradient(180deg,#fff7ef_0%,#ead8c8_100%)]">
                        <Image
                          alt={`${product.brand} ${product.productName}`}
                          className="object-cover"
                          fill
                          sizes="80px"
                          src={product.image}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold tracking-[0.18em] text-[#8a5100]">
                          {product.brand.toUpperCase()}
                        </p>
                        <h3 className="mt-0.5 text-[14px] font-bold leading-[1.2] tracking-[-0.025em] text-[#231a12]">
                          {product.productName}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="text-[11px] font-semibold text-[#8b7a6c]">
                            {product.primarySize}
                          </span>
                          <span className="text-[11px] text-[#c0ac9e]">·</span>
                          <span className="text-[11px] font-semibold text-[#8b7a6c]">
                            {product.vehicleType}
                          </span>
                        </div>
                      </div>

                      {/* Qty badge */}
                      <span className="absolute right-3 top-3 rounded-full border border-[#ead9c9] bg-white px-2 py-0.5 text-[10px] font-bold text-[#8b7a6c]">
                        ×1
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add more CTA card */}
              <div className="rounded-[24px] border border-dashed border-[#d9c4ae] bg-[#fdf5ec] p-5">
                <p className="text-[13px] leading-[1.75] text-[#6f6258]">
                  Need more options? Browse and shortlist additional tyres before submitting.
                </p>
                <button
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-[#231a12]/18 bg-white px-4 text-[12px] font-bold text-[#231a12] shadow-[0_2px_8px_rgba(35,26,18,0.06)] transition-all duration-300 hover:border-[#231a12] hover:bg-[#231a12] hover:text-[#fff8f5]"
                  type="button"
                >
                  Browse products
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </aside>

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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group relative">
                    <label className="absolute left-4 top-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b7a6c] transition-all duration-200">
                      Full Name <span className="text-[#f69300]">*</span>
                    </label>
                    <input
                      className="h-[68px] w-full rounded-[16px] border border-[#ead9c9] bg-[#fffaf6] pb-3 pt-7 px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      // placeholder="e.g. Rajesh Kumar"
                      type="text"
                    />
                  </div>

                  <div className="relative">
                    <label className="absolute left-4 top-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b7a6c]">
                      Contact Number <span className="text-[#f69300]">*</span>
                    </label>
                    <input
                      className="h-[68px] w-full rounded-[16px] border border-[#ead9c9] bg-[#fffaf6] pb-3 pt-7 px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      placeholder="+91 98765 43210"
                      type="tel"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <label className="absolute left-4 top-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b7a6c]">
                      Email Address
                    </label>
                    <input
                      className="h-[68px] w-full rounded-[16px] border border-[#ead9c9] bg-[#fffaf6] pb-3 pt-7 px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      placeholder="you@company.com"
                      type="email"
                    />
                  </div>

                  <div className="relative">
                    <label className="absolute left-4 top-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b7a6c]">
                      Company
                    </label>
                    <input
                      className="h-[68px] w-full rounded-[16px] border border-[#ead9c9] bg-[#fffaf6] pb-3 pt-7 px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
                      placeholder="Optional"
                      type="text"
                    />
                  </div>
                </div>


                {/* Message */}
                <div className="relative mt-4">
                  <label className="absolute left-4 top-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b7a6c]">
                    Message
                  </label>
                  <textarea
                    className="min-h-[150px] w-full rounded-[16px] border border-[#ead9c9] bg-[#fffaf6] pb-4 pt-8 px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)] resize-none"
                    placeholder="Quantity needed, delivery location, urgency, special requirements..."
                  />
                </div>

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
