"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Search
} from "lucide-react";
import { Raleway } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { useForm, type Path, type SubmitHandler } from "react-hook-form";

import {
  CLAIM_BRAND_OPTIONS,
  CLAIM_PHOTO_MIN,
  claimCustomerSchema,
  claimTyreSchema,
  submitClaim,
  type ClaimSubmission
} from "../lib/claims";
import { ClaimImageUploader } from "./claim-image-uploader";
import { toast } from "./toaster";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

// One resolver over both text steps; photos are tracked outside RHF because a
// File list can't flow through a zod string schema.
const claimTextSchema = claimCustomerSchema.merge(claimTyreSchema);
type ClaimTextValues = ReturnType<typeof claimTextSchema.parse>;

const STEPS = [
  { title: "Your details", fields: ["customerName", "phone", "email", "companyName"] },
  {
    title: "Tyre & invoice",
    fields: [
      "brand",
      "tyreSize",
      "tyrePattern",
      "tyreSerialNumber",
      "invoiceNumber",
      "invoiceDate",
      "customerRemarks"
    ]
  },
  { title: "Photographs", fields: [] },
  { title: "Review", fields: [] }
] as const;

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
  return <p className="mt-1.5 text-[11px] font-medium text-[#a82424]">{message}</p>;
}

function inputClass(hasError: boolean) {
  return `${baseInputClass} ${hasError ? errorStateClass : normalStateClass}`;
}

export function ClaimForm() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [claimNumber, setClaimNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ClaimTextValues>({
    resolver: zodResolver(claimTextSchema),
    mode: "onTouched",
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      companyName: "",
      brand: "",
      tyreSize: "",
      tyrePattern: "",
      tyreSerialNumber: "",
      invoiceNumber: "",
      invoiceDate: "",
      customerRemarks: ""
    }
  });

  const phoneField = register("phone");

  async function goNext() {
    // Photograph step is validated manually.
    if (step === 2) {
      if (photos.length < CLAIM_PHOTO_MIN) {
        setPhotoError(`Please add at least ${CLAIM_PHOTO_MIN} photographs.`);
        return;
      }
      setPhotoError(null);
      setStep(3);
      return;
    }

    const fields = STEPS[step].fields as readonly Path<ClaimTextValues>[];
    const valid = fields.length === 0 || (await trigger(fields));
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  const onSubmit: SubmitHandler<ClaimTextValues> = async (values) => {
    setSubmitError(null);

    if (photos.length < CLAIM_PHOTO_MIN) {
      setPhotoError(`Please add at least ${CLAIM_PHOTO_MIN} photographs.`);
      setStep(2);
      return;
    }

    try {
      const submission: ClaimSubmission = { ...values, photos };
      const result = await submitClaim(submission);
      setClaimNumber(result.claimNumber);
    } catch {
      setSubmitError(
        "Couldn't submit your claim right now. Please try again in a moment."
      );
    }
  };

  async function copyClaimNumber() {
    if (!claimNumber) return;
    try {
      await navigator.clipboard.writeText(claimNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Couldn't copy — please copy the number manually.", {
        variant: "warning"
      });
    }
  }

  function startAnother() {
    reset();
    setPhotos([]);
    setPhotoError(null);
    setSubmitError(null);
    setClaimNumber(null);
    setStep(0);
  }

  /* ── Success state ─────────────────────────────────────────────────── */
  if (claimNumber) {
    return (
      <div className="flex flex-col items-center rounded-[16px] border border-[#ead9c9]/70 bg-[#fffbf7] p-8 text-center sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1de] text-[#a85d00] ring-4 ring-[#fff1de]/60">
          <CheckCircle2 aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
        </div>
        <h3
          className={`${raleway.className} mt-5 text-[21px] font-semibold tracking-[-0.02em] text-[#231a12]`}
        >
          Claim submitted
        </h3>
        <p className="mt-2.5 max-w-md text-[13.5px] leading-[1.7] text-[#6f6258]">
          We&apos;ve received your claim and a confirmation email is on its way.
          Save your claim number to track progress at any time.
        </p>

        <div className="mt-6 w-full max-w-xs">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b7a6c]">
            Your Claim Number
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-[12px] border border-[#ead9c9] bg-white px-4 py-3">
            <span className="font-display text-[18px] font-bold tracking-[0.02em] text-[#231a12]">
              {claimNumber}
            </span>
            <button
              type="button"
              onClick={copyClaimNumber}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ead9c9] bg-[#fff8f5] px-2.5 py-1 text-[11px] font-semibold text-[#a85d00] transition-colors hover:border-[#f0b366] hover:bg-[#fff1de]"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={2.5} /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" strokeWidth={2.5} /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href={`/claims/track?claimNumber=${encodeURIComponent(claimNumber)}`}
            className="group inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[12.5px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
            Track this claim
          </Link>
          <button
            type="button"
            onClick={startAnother}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#231a12]/15 bg-white px-5 text-[12.5px] font-bold text-[#231a12] transition-colors duration-200 hover:border-[#a85d00] hover:bg-[#fff1e3] hover:text-[#a85d00]"
          >
            Raise another claim
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────────────────── */
  return (
    <div className={raleway.className}>
      {/* Stepper */}
      <ol className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "current" : "upcoming";
          return (
            <li key={s.title} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-300",
                    state === "done"
                      ? "bg-[#a85d00] text-white"
                      : state === "current"
                        ? "bg-[#fff1de] text-[#a85d00] ring-2 ring-[#a85d00]/30"
                        : "bg-[#f1e6da] text-[#b7a695]"
                  ].join(" ")}
                >
                  {state === "done" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={[
                    "hidden text-[11.5px] font-semibold sm:inline",
                    state === "upcoming" ? "text-[#b7a695]" : "text-[#231a12]"
                  ].join(" ")}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <span
                  className={[
                    "h-px flex-1 transition-colors duration-300",
                    i < step ? "bg-[#a85d00]" : "bg-[#ead9c9]"
                  ].join(" ")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <form
        className="mt-7"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Step 0 — Your details */}
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <label className="block">
              <span className={labelClass}>
                Full Name <span className="text-[#a85d00]">*</span>
              </span>
              <input
                className={inputClass(!!errors.customerName)}
                placeholder="Your full name"
                {...register("customerName")}
              />
              <FieldError message={errors.customerName?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>
                Contact Number <span className="text-[#a85d00]">*</span>
              </span>
              <input
                inputMode="numeric"
                maxLength={15}
                placeholder="10-digit mobile number"
                className={inputClass(!!errors.phone)}
                {...phoneField}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 15);
                  void phoneField.onChange(e);
                }}
              />
              <FieldError message={errors.phone?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>
                Email Address <span className="text-[#a85d00]">*</span>
              </span>
              <input
                type="email"
                placeholder="name@company.com"
                className={inputClass(!!errors.email)}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>Company</span>
              <input
                placeholder="Company name (optional)"
                className={inputClass(!!errors.companyName)}
                {...register("companyName")}
              />
              <FieldError message={errors.companyName?.message} />
            </label>
          </div>
        ) : null}

        {/* Step 1 — Tyre & invoice */}
        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <label className="block">
              <span className={labelClass}>
                Tyre Brand <span className="text-[#a85d00]">*</span>
              </span>
              <select
                className={inputClass(!!errors.brand)}
                defaultValue={getValues("brand")}
                {...register("brand")}
              >
                <option value="" disabled>
                  Select a brand
                </option>
                {CLAIM_BRAND_OPTIONS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <FieldError message={errors.brand?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>
                Tyre Size <span className="text-[#a85d00]">*</span>
              </span>
              <input
                placeholder="e.g. 27.00R49"
                className={inputClass(!!errors.tyreSize)}
                {...register("tyreSize")}
              />
              <FieldError message={errors.tyreSize?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>Pattern</span>
              <input
                placeholder="Tread pattern (optional)"
                className={inputClass(!!errors.tyrePattern)}
                {...register("tyrePattern")}
              />
              <FieldError message={errors.tyrePattern?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>Serial / DOT Number</span>
              <input
                placeholder="Casing serial (optional)"
                className={inputClass(!!errors.tyreSerialNumber)}
                {...register("tyreSerialNumber")}
              />
              <FieldError message={errors.tyreSerialNumber?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>
                Invoice Number <span className="text-[#a85d00]">*</span>
              </span>
              <input
                placeholder="Invoice / bill number"
                className={inputClass(!!errors.invoiceNumber)}
                {...register("invoiceNumber")}
              />
              <FieldError message={errors.invoiceNumber?.message} />
            </label>

            <label className="block">
              <span className={labelClass}>
                Invoice Date <span className="text-[#a85d00]">*</span>
              </span>
              <input
                type="date"
                className={inputClass(!!errors.invoiceDate)}
                {...register("invoiceDate")}
              />
              <FieldError message={errors.invoiceDate?.message} />
            </label>

            <label className="block sm:col-span-2">
              <span className={labelClass}>Describe the concern</span>
              <textarea
                placeholder="Tell us what went wrong — where and how the issue appeared, running hours, etc."
                className={`${inputClass(!!errors.customerRemarks)} min-h-[110px] resize-none py-3`}
                {...register("customerRemarks")}
              />
              <FieldError message={errors.customerRemarks?.message} />
            </label>
          </div>
        ) : null}

        {/* Step 2 — Photographs */}
        {step === 2 ? (
          <div>
            <div className="mb-4">
              <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#231a12]">
                Supporting photographs
              </h3>
              <p className="mt-1 text-[12.5px] leading-[1.65] text-[#6f6258]">
                Add {CLAIM_PHOTO_MIN}–10 clear photos: the full tyre, the damaged
                area up close, the serial marking, and your invoice.
              </p>
            </div>
            <ClaimImageUploader
              files={photos}
              onChange={(next) => {
                setPhotos(next);
                if (next.length >= CLAIM_PHOTO_MIN) setPhotoError(null);
              }}
              disabled={isSubmitting}
            />
            {photoError ? (
              <p className="mt-3 rounded-[10px] border border-[#f3c0c0] bg-[#fff5f5] px-3 py-2 text-[12px] font-medium text-[#a82424]">
                {photoError}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Step 3 — Review */}
        {step === 3 ? (
          <ClaimReview values={getValues()} photoCount={photos.length} />
        ) : null}

        {submitError ? (
          <p className="mt-5 rounded-[10px] border border-[#f3c0c0] bg-[#fff5f5] px-4 py-3 text-[13px] font-medium text-[#a82424]">
            {submitError}
          </p>
        ) : null}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#ead9c9]/60 pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-[#231a12]/12 bg-white px-4 text-[12.5px] font-bold text-[#231a12] transition-colors duration-200 hover:border-[#a85d00] hover:text-[#a85d00] disabled:opacity-60"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="group inline-flex h-11 items-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)]"
            >
              Continue
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex h-11 items-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  Submitting
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                </>
              ) : (
                <>
                  Submit Claim
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ── Review summary ──────────────────────────────────────────────────── */

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-[12px] text-[#8b7a6c]">{label}</span>
      <span className="text-right text-[12.5px] font-semibold text-[#231a12]">
        {value && value.trim() ? value : "—"}
      </span>
    </div>
  );
}

function ClaimReview({
  values,
  photoCount
}: {
  values: ClaimTextValues;
  photoCount: number;
}) {
  return (
    <div>
      <p className="mb-4 text-[12.5px] leading-[1.65] text-[#6f6258]">
        Please review your claim before submitting.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-[14px] border border-[#ead9c9] bg-[#fffbf7] p-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a85d00]">
            Your details
          </h4>
          <div className="mt-1.5 divide-y divide-[#ead9c9]/60">
            <ReviewRow label="Name" value={values.customerName} />
            <ReviewRow label="Phone" value={values.phone} />
            <ReviewRow label="Email" value={values.email} />
            <ReviewRow label="Company" value={values.companyName} />
          </div>
        </section>

        <section className="rounded-[14px] border border-[#ead9c9] bg-[#fffbf7] p-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a85d00]">
            Tyre & invoice
          </h4>
          <div className="mt-1.5 divide-y divide-[#ead9c9]/60">
            <ReviewRow label="Brand" value={values.brand} />
            <ReviewRow label="Size" value={values.tyreSize} />
            <ReviewRow label="Pattern" value={values.tyrePattern} />
            <ReviewRow label="Serial" value={values.tyreSerialNumber} />
            <ReviewRow label="Invoice #" value={values.invoiceNumber} />
            <ReviewRow label="Invoice date" value={values.invoiceDate} />
          </div>
        </section>
      </div>

      {values.customerRemarks && values.customerRemarks.trim() ? (
        <section className="mt-4 rounded-[14px] border border-[#ead9c9] bg-[#fffbf7] p-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a85d00]">
            Concern
          </h4>
          <p className="mt-2 text-[12.5px] leading-[1.7] text-[#4f463c]">
            {values.customerRemarks}
          </p>
        </section>
      ) : null}

      <section className="mt-4 flex items-center gap-2.5 rounded-[14px] border border-[#ead9c9] bg-[#fffbf7] p-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1de] text-[#a85d00]">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-[12.5px] font-semibold text-[#231a12]">
          {photoCount} photograph{photoCount === 1 ? "" : "s"} attached
        </span>
      </section>
    </div>
  );
}
