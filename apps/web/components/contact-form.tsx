"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Raleway } from "next/font/google";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { useEnquiryProducts } from "../lib/enquiry";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// Client-side schema — mirrors the backend validation in
// apps/api/app/api/web/enquiries/route.ts so users get instant feedback.
const enquiryFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(1, "Contact number is required.")
    .regex(/^\d{10,15}$/, "Enter a valid phone number (10–15 digits)."),
  email: z
    .email("Enter a valid email address.")
    .max(160, "Email is too long.")
    .or(z.literal(""))
    .optional(),
  companyName: z
    .string()
    .trim()
    .max(160, "Company name is too long.")
    .optional(),
  message: z
    .string()
    .trim()
    .max(2000, "Message must be under 2000 characters.")
    .optional(),
});

type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

const FORM_FIELDS: ReadonlyArray<keyof EnquiryFormValues> = [
  "customerName",
  "phone",
  "email",
  "companyName",
  "message",
];

const baseInputClass =
  "h-10 w-full rounded-[10px] border bg-[#fff8f5] px-4 text-[13px] font-medium text-[#231a12] outline-none transition-colors duration-200 placeholder:text-[#bfad9f] placeholder:font-normal disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-[13.5px]";

const normalStateClass =
  "border-[#ead9c9] hover:border-[#d8b997] focus:border-[#a85d00] focus:ring-2 focus:ring-[#a85d00]/12";

const errorStateClass =
  "border-[#e0a3a3] hover:border-[#d98a8a] focus:border-[#a82424] focus:ring-2 focus:ring-[#a82424]/15";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7a6c]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-[11px] font-medium text-[#a82424]">{message}</p>
  );
}

export function ContactForm() {
  const { items, clear } = useEnquiryProducts();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      companyName: "",
      message: "",
    },
  });

  // Keep the phone field numeric-only as the user types (also blocks paste of
  // letters/symbols) while still letting react-hook-form track the value.
  const phoneField = register("phone");

  const onSubmit: SubmitHandler<EnquiryFormValues> = async (values) => {
    setSubmitError(null);

    const productIds = items
      .map((p) => p.id)
      .filter((id): id is string => Boolean(id));

    try {
      const res = await fetch(`${API_BASE}/api/web/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: values.customerName,
          phone: values.phone,
          email: values.email || undefined,
          companyName: values.companyName || undefined,
          message: values.message || undefined,
          productIds,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: string;
            errors?: Record<string, string[] | undefined>;
          }
        | null;

      if (!res.ok || !json?.ok) {
        // Surface backend field-level validation errors against their inputs.
        if (json?.errors) {
          for (const [field, messages] of Object.entries(json.errors)) {
            if (
              messages?.length &&
              FORM_FIELDS.includes(field as keyof EnquiryFormValues)
            ) {
              setError(field as keyof EnquiryFormValues, {
                message: messages[0],
              });
            }
          }
        }
        setSubmitError(
          json?.message ?? "Failed to submit enquiry. Please try again."
        );
        return;
      }

      clear();
      reset();
      setSubmitted(true);
    } catch {
      setSubmitError(
        "Couldn't reach the server. Please check your connection and try again."
      );
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-[16px] border border-[#ead9c9]/70 bg-[#fffbf7] p-10 text-center mt-6.5">
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
          onClick={() => setSubmitted(false)}
          type="button"
        >
          Send another enquiry
          <ArrowRight aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <form
      className={`${raleway.className} mt-7`}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <label className="block">
          <span className={labelClass}>
            Full Name <span className="text-[#a85d00]">*</span>
          </span>
          <input
            aria-invalid={errors.customerName ? "true" : "false"}
            className={`${baseInputClass} ${errors.customerName ? errorStateClass : normalStateClass}`}
            disabled={isSubmitting}
            placeholder="Your full name"
            type="text"
            {...register("customerName")}
          />
          <FieldError message={errors.customerName?.message} />
        </label>

        <label className="block">
          <span className={labelClass}>
            Contact Number <span className="text-[#a85d00]">*</span>
          </span>
          <input
            aria-invalid={errors.phone ? "true" : "false"}
            className={`${baseInputClass} ${errors.phone ? errorStateClass : normalStateClass}`}
            disabled={isSubmitting}
            inputMode="numeric"
            maxLength={15}
            placeholder="10-digit mobile number"
            type="tel"
            {...phoneField}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 15);
              void phoneField.onChange(e);
            }}
          />
          <FieldError message={errors.phone?.message} />
        </label>

        <label className="block">
          <span className={labelClass}>Email Address</span>
          <input
            aria-invalid={errors.email ? "true" : "false"}
            className={`${baseInputClass} ${errors.email ? errorStateClass : normalStateClass}`}
            disabled={isSubmitting}
            placeholder="name@company.com"
            type="email"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </label>

        <label className="block">
          <span className={labelClass}>Company</span>
          <input
            aria-invalid={errors.companyName ? "true" : "false"}
            className={`${baseInputClass} ${errors.companyName ? errorStateClass : normalStateClass}`}
            disabled={isSubmitting}
            placeholder="Company name"
            type="text"
            {...register("companyName")}
          />
          <FieldError message={errors.companyName?.message} />
        </label>
      </div>

      <label className="mt-5 block">
        <span className={labelClass}>Message</span>
        <textarea
          aria-invalid={errors.message ? "true" : "false"}
          className={`${baseInputClass} ${errors.message ? errorStateClass : normalStateClass} min-h-[140px] resize-none py-3.5`}
          disabled={isSubmitting}
          placeholder="Quantity, delivery location, urgency, special requirements…"
          {...register("message")}
        />
        <FieldError message={errors.message?.message} />
      </label>

      {submitError ? (
        <p className="mt-4 rounded-[10px] border border-[#f3c0c0] bg-[#fff5f5] px-4 py-3 text-[13px] font-medium text-[#a82424]">
          {submitError}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col gap-4 border-t border-[#ead9c9]/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-1.5 max-w-sm text-[11.5px] leading-[1.65] text-[#9b8d82]">
          By submitting you agree to be contacted regarding your enquiry. We do
          not share your data.
        </p>

        <button
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)] disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
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
