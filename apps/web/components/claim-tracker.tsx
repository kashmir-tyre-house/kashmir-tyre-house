"use client";

import { AlertCircle, Check, Loader2, Search, XCircle } from "lucide-react";
import { Raleway } from "next/font/google";
import { useState } from "react";

import {
  CLAIM_STAGES,
  ClaimNotFoundError,
  isValidClaimNumber,
  REJECTED_STAGE,
  stageIndex,
  trackClaim,
  type ClaimTrackResult
} from "../lib/claims";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

type Status = "idle" | "loading" | "found" | "notfound" | "error";

export function ClaimTracker({ initialClaimNumber = "" }: { initialClaimNumber?: string }) {
  const [value, setValue] = useState(initialClaimNumber);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ClaimTrackResult | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function lookup(claimNumber: string) {
    if (!isValidClaimNumber(claimNumber)) {
      setFieldError("Enter a claim number like KTH-2608-0042.");
      return;
    }
    setFieldError(null);
    setStatus("loading");
    setResult(null);

    try {
      const data = await trackClaim(claimNumber);
      setResult(data);
      setStatus("found");
    } catch (err) {
      setStatus(err instanceof ClaimNotFoundError ? "notfound" : "error");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void lookup(value);
  }

  // Auto-run once when arriving with a prefilled claim number (from success).
  const [autoRan, setAutoRan] = useState(false);
  if (initialClaimNumber && !autoRan) {
    setAutoRan(true);
    void lookup(initialClaimNumber);
  }

  return (
    <div className={raleway.className}>
      <form onSubmit={onSubmit} noValidate>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7a6c]">
          Claim Number
        </label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder="KTH-2608-0042"
            className={[
              "h-11 w-full rounded-[10px] border bg-[#fff8f5] px-4 text-[14px] font-semibold tracking-[0.02em] text-[#231a12] outline-none transition-colors duration-200 placeholder:font-normal placeholder:text-[#bfad9f]",
              fieldError
                ? "border-[#e0a3a3] focus:border-[#a82424] focus:ring-2 focus:ring-[#a82424]/15"
                : "border-[#ead9c9] hover:border-[#d8b997] focus:border-[#a85d00] focus:ring-2 focus:ring-[#a85d00]/12"
            ].join(" ")}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            ) : (
              <Search className="h-4 w-4" strokeWidth={2.5} />
            )}
            Track
          </button>
        </div>
        {fieldError ? (
          <p className="mt-1.5 text-[11px] font-medium text-[#a82424]">{fieldError}</p>
        ) : null}
      </form>

      {/* Results */}
      <div className="mt-6">
        {status === "loading" ? <TrackerSkeleton /> : null}

        {status === "notfound" ? (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" strokeWidth={2} />}
            title="No claim found"
            body="We couldn't find a claim with that number. Please check it and try again."
          />
        ) : null}

        {status === "error" ? (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" strokeWidth={2} />}
            title="Something went wrong"
            body="We couldn't look up your claim right now. Please try again in a moment."
          />
        ) : null}

        {status === "found" && result ? <ClaimTimeline result={result} /> : null}
      </div>
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div className="rounded-[18px] border border-[#ead9c9] bg-white p-6">
      <div className="h-4 w-40 animate-pulse rounded bg-[#efe3d6]" />
      <div className="mt-5 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[#efe3d6]" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-32 animate-pulse rounded bg-[#efe3d6]" />
              <div className="h-2.5 w-52 animate-pulse rounded bg-[#f3ebe1]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-[18px] border border-[#ead9c9] bg-[#fffbf7] p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbe9e4] text-[#a82424]">
        {icon}
      </span>
      <h3 className="mt-4 text-[16px] font-bold tracking-[-0.01em] text-[#231a12]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-[12.5px] leading-[1.65] text-[#6f6258]">
        {body}
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function ClaimTimeline({ result }: { result: ClaimTrackResult }) {
  const rejected = result.status === "rejected";
  const activeIndex = rejected ? -1 : stageIndex(result.status);

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#ead9c9] bg-white shadow-[0_10px_32px_rgba(35,26,18,0.05)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] px-5 py-4 sm:px-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b7a6c]">
            Claim
          </p>
          <p className="font-display text-[18px] font-bold tracking-[0.02em] text-[#231a12]">
            {result.claimNumber}
          </p>
        </div>
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold",
            rejected
              ? "bg-[#fbe9e4] text-[#a82424]"
              : result.status === "approved"
                ? "bg-[#e4f4ea] text-[#0a7d40]"
                : "bg-[#fff1de] text-[#a85d00]"
          ].join(" ")}
        >
          {rejected ? (
            <XCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : result.status === "approved" ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <Loader2 className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          {rejected
            ? REJECTED_STAGE.label
            : CLAIM_STAGES[activeIndex]?.label ?? "Submitted"}
        </span>
      </div>

      {/* Timeline */}
      <div className="px-5 py-6 sm:px-7">
        {rejected ? (
          <div>
            <ol className="relative">
              {CLAIM_STAGES.slice(0, 2).map((stage, i) => (
                <TimelineNode
                  key={stage.key}
                  label={stage.label}
                  description={stage.description}
                  state="done"
                  isLast={false}
                  muted={i === 1}
                />
              ))}
              <TimelineNode
                label={REJECTED_STAGE.label}
                description={REJECTED_STAGE.description}
                state="rejected"
                isLast
              />
            </ol>

            {result.remarks ? (
              <div className="mt-5 rounded-[12px] border border-[#f0d4cc] bg-[#fdf3f0] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a82424]">
                  Remarks
                </p>
                <p className="mt-1.5 text-[12.5px] leading-[1.7] text-[#6f4a44]">
                  {result.remarks}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <ol className="relative">
            {CLAIM_STAGES.map((stage, i) => {
              const state =
                i < activeIndex ? "done" : i === activeIndex ? "current" : "upcoming";
              return (
                <TimelineNode
                  key={stage.key}
                  label={stage.label}
                  description={stage.description}
                  state={state}
                  isLast={i === CLAIM_STAGES.length - 1}
                />
              );
            })}
          </ol>
        )}
      </div>

      {/* Footer meta */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-[#ead9c9]/70 bg-[#fffbf7] px-5 py-3 text-[11.5px] text-[#8b7a6c] sm:px-7">
        <span>
          Submitted{" "}
          <strong className="font-semibold text-[#4f463c]">
            {formatDate(result.submittedAt)}
          </strong>
        </span>
        <span>
          Last updated{" "}
          <strong className="font-semibold text-[#4f463c]">
            {formatDate(result.updatedAt)}
          </strong>
        </span>
      </div>
    </div>
  );
}

function TimelineNode({
  label,
  description,
  state,
  isLast,
  muted = false
}: {
  label: string;
  description: string;
  state: "done" | "current" | "upcoming" | "rejected";
  isLast: boolean;
  muted?: boolean;
}) {
  return (
    <li className="relative flex gap-3.5 pb-6 last:pb-0">
      {/* Connector line */}
      {!isLast ? (
        <span
          aria-hidden="true"
          className={[
            "absolute left-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2",
            state === "done" ? "bg-[#a85d00]" : "bg-[#ead9c9]"
          ].join(" ")}
        />
      ) : null}

      {/* Node */}
      <span
        className={[
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
          state === "done"
            ? "bg-[#a85d00] text-white"
            : state === "current"
              ? "bg-[#fff1de] text-[#a85d00] ring-2 ring-[#a85d00]/35"
              : state === "rejected"
                ? "bg-[#a82424] text-white"
                : "bg-[#f1e6da] text-[#b7a695]"
        ].join(" ")}
      >
        {state === "done" ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : state === "rejected" ? (
          <XCircle className="h-4 w-4" strokeWidth={2.5} />
        ) : state === "current" ? (
          <span className="h-2 w-2 rounded-full bg-[#a85d00]" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-[#c9b6a2]" />
        )}
      </span>

      <div className="pt-1">
        <p
          className={[
            "text-[13.5px] font-bold tracking-[-0.01em]",
            state === "upcoming" || muted ? "text-[#b7a695]" : "text-[#231a12]"
          ].join(" ")}
        >
          {label}
        </p>
        <p
          className={[
            "mt-0.5 text-[12px] leading-[1.6]",
            state === "upcoming" ? "text-[#c0b0a0]" : "text-[#6f6258]"
          ].join(" ")}
        >
          {description}
        </p>
      </div>
    </li>
  );
}
