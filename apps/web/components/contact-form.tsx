"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Raleway } from "next/font/google";
import { useState } from "react";

import { useEnquiryProducts } from "../lib/enquiry";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const inputClass =
  "h-11 w-full rounded-[10px] border border-[#ead9c9] bg-[#fff8f5] px-4 text-[13.5px] font-medium text-[#231a12] outline-none transition-colors duration-200 placeholder:text-[#bfad9f] placeholder:font-normal hover:border-[#d8b997] focus:border-[#a85d00] focus:ring-2 focus:ring-[#a85d00]/12 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7a6c]";

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
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to submit enquiry.",
      });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="flex flex-col items-center rounded-[16px] border border-[#ead9c9]/70 bg-[#fffbf7] p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1de] text-[#a85d00] ring-4 ring-[#fff1de]/60">
          <CheckCircle2 aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
        </div>
        <h3
          className={`${raleway.className} mt-5 text-[20px] font-semibold tracking-[-0.02em] text-[#231a12]`}
        >
          Enquiry sent
        </h3>
        <p className="mt-3 max-w-md text-[13.5px] leading-[1.7] text-[#6f6258]">
          Thanks — we&apos;ve received your enquiry and our team will reach out
          shortly with pricing and availability.
        </p>
        <button
          className="mt-7 inline-flex h-9 items-center gap-2 rounded-full border border-[#231a12]/15 bg-white px-4 text-[12px] font-bold text-[#231a12] shadow-[0_2px_8px_rgba(35,26,18,0.04)] transition-colors duration-200 hover:border-[#a85d00] hover:bg-[#fff1e3] hover:text-[#a85d00]"
          onClick={() => setStatus({ kind: "idle" })}
          type="button"
        >
          Send another enquiry
          <ArrowRight aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <form className={`${raleway.className} mt-7`} onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>
            Full Name <span className="text-[#a85d00]">*</span>
          </span>
          <input
            className={inputClass}
            disabled={submitting}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your full name"
            required
            type="text"
            value={customerName}
          />
        </label>

        <label className="block">
          <span className={labelClass}>
            Contact Number <span className="text-[#a85d00]">*</span>
          </span>
          <input
            className={inputClass}
            disabled={submitting}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 …"
            required
            type="tel"
            value={phone}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Email Address</span>
          <input
            className={inputClass}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Company</span>
          <input
            className={inputClass}
            disabled={submitting}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            type="text"
            value={companyName}
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className={labelClass}>Message</span>
        <textarea
          className={`${inputClass} min-h-[140px] py-3.5 resize-none`}
          disabled={submitting}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Quantity, delivery location, urgency, special requirements…"
          value={message}
        />
      </label>

      {status.kind === "error" ? (
        <p className="mt-4 rounded-[10px] border border-[#f3c0c0] bg-[#fff5f5] px-4 py-3 text-[13px] font-medium text-[#a82424]">
          {status.message}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col gap-4 border-t border-[#ead9c9]/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-1.5 max-w-sm text-[11.5px] leading-[1.65] text-[#9b8d82]">
          By submitting you agree to be contacted regarding your enquiry. We do
          not share your data.
        </p>

        <button
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)] disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
          disabled={submitting}
          type="submit"
        >
          {submitting ? (
            <>
              Sending
              <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
            </>
          ) : (
            <>
              Send Enquiry
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
