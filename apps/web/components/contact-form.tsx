"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Raleway } from "next/font/google";
import { useState } from "react";

import { useEnquiryProducts } from "../lib/enquiry";
import { Reveal } from "./reveal";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "success" } | { kind: "error"; message: string };

export function ContactForm() {
  const { items, clear } = useEnquiryProducts();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submitting = status.kind === "submitting";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "submitting" });

    const productIds = items.map((p) => p.id).filter((id): id is string => Boolean(id));

    try {
      const res = await fetch(`${API_BASE}/api/web/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email: email || undefined,
          companyName: companyName || undefined,
          message: message || undefined,
          productIds,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.message ?? "Failed to submit enquiry. Please try again.");
      }

      clear();
      setCustomerName("");
      setPhone("");
      setEmail("");
      setCompanyName("");
      setMessage("");
      setStatus({ kind: "success" });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : "Failed to submit enquiry." });
    }
  }

  if (status.kind === "success") {
    return (
      <Reveal distance="sm">
        <div className="flex flex-col items-center rounded-[18px] border border-[#ead9c9] bg-[#fffaf6] p-10 text-center shadow-[0_4px_14px_rgba(35,26,18,0.04)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1de] text-[#a06000]">
            <CheckCircle2 aria-hidden="true" className="h-7 w-7" strokeWidth={2} />
          </div>
          <h3 className={`${raleway.className} mt-5 text-[22px] font-semibold tracking-[-0.03em] text-[#231a12]`}>
            Enquiry sent
          </h3>
          <p className="mt-3 max-w-md text-[14px] leading-[1.75] text-[#6f6258]">
            Thanks — we&apos;ve received your enquiry and our team will reach out shortly with pricing
            and availability.
          </p>
          <button
            className="mt-7 inline-flex h-10 items-center gap-2 rounded-full border border-[#231a12]/18 bg-white px-5 text-[12px] font-bold text-[#231a12] shadow-[0_2px_8px_rgba(35,26,18,0.06)] transition-all duration-300 hover:border-[#231a12] hover:bg-[#231a12] hover:text-[#fff8f5]"
            onClick={() => setStatus({ kind: "idle" })}
            type="button"
          >
            Send another enquiry
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </Reveal>
    );
  }

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      {/* Row 1 */}
      <Reveal delayMs={80} distance="sm">
        <div className={`${raleway.className} grid gap-4 sm:grid-cols-2`}>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
              Full Name <span className="text-[#f69300] text-[18px]">*</span>
            </span>
            <input
              className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
              disabled={submitting}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your full name"
              required
              type="text"
              value={customerName}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
              Contact Number <span className="text-[#f69300] text-[18px]">*</span>
            </span>
            <input
              className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
              disabled={submitting}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your contact number"
              required
              type="tel"
              value={phone}
            />
          </label>
        </div>
      </Reveal>

      {/* Row 2 */}
      <Reveal className="mt-4" delayMs={160} distance="sm">
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
              Email Address
            </span>
            <input
              className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
              disabled={submitting}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
              Company
            </span>
            <input
              className="h-[45px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)]"
              disabled={submitting}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
              type="text"
              value={companyName}
            />
          </label>
        </div>
      </Reveal>

      {/* Message */}
      <Reveal className="mt-4" delayMs={240} distance="sm">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold tracking-[0.1em] text-[#8b7a6c]">
            Message
          </span>
          <textarea
            className="min-h-[150px] w-full rounded-[12px] border border-[#ead9c9] bg-[#fffaf6] px-4 py-4 text-[14px] font-semibold text-[#231a12] outline-none transition-all duration-300 placeholder:text-[#bfad9f] placeholder:font-normal focus:border-[#f69300] focus:shadow-[0_0_0_3px_rgba(246,147,0,0.1)] resize-none"
            disabled={submitting}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Quantity needed, delivery location, urgency, special requirements..."
            value={message}
          />
        </label>
      </Reveal>

      {status.kind === "error" ? (
        <p className="mt-4 rounded-[10px] border border-[#f3c0c0] bg-[#fff5f5] px-4 py-3 text-[13px] font-medium text-[#a82424]">
          {status.message}
        </p>
      ) : null}

      {/* Footer row */}
      <Reveal className="mt-7" delayMs={320} distance="sm">
        <div className="flex flex-col gap-4 border-t border-[#f0dfd1] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-[12px] leading-[1.8] text-[#9b8d82]">
            By submitting you agree to be contacted regarding your enquiry. We do not share your data.
          </p>

          <button
            className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-[14px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-semibold text-white shadow-[0_14px_34px_rgba(246,147,0,0.28)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_18px_40px_rgba(246,147,0,0.36)] disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <>
                Sending
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" strokeWidth={2.5} />
              </>
            ) : (
              <>
                Send Enquiry
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </Reveal>
    </form>
  );
}
