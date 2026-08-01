// Client-side domain layer for the tyre Claim Management flow.
//
// The submission and tracking calls are currently STUBBED — they simulate the
// backend so the whole UI flow is usable now. When the API lands (see the
// technical doc: POST /api/web/claims, GET /api/web/claims/track), replace the
// bodies of `submitClaim` and `trackClaim` with real fetches; the shapes here
// are already aligned with the planned route handlers.

import { z } from "zod";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
// Flip to true once the route handlers exist to route through the real API.
const USE_REAL_API = false;

/* ── Tracking stages ─────────────────────────────────────────────────────
   Customer-visible only. The internal workflow (under review, forwarded to
   brand, admin remarks) is intentionally not represented here. */

export const CLAIM_STAGES = [
  {
    key: "submitted",
    label: "Claim Submitted",
    description: "We’ve received your claim and generated a claim number."
  },
  {
    key: "under_review",
    label: "Under Review",
    description: "Our team is reviewing your tyre, invoice and photographs."
  },
  {
    key: "brand_verification",
    label: "Brand Verification",
    description: "Your claim has been forwarded to the brand for assessment."
  },
  {
    key: "approved",
    label: "Approved",
    description: "The brand has confirmed approval of your claim."
  }
] as const;

export type ClaimStageKey = (typeof CLAIM_STAGES)[number]["key"];

// Terminal negative outcome — shown distinctly from the linear stages above.
export const REJECTED_STAGE = {
  key: "rejected",
  label: "Not Approved",
  description: "This claim was closed. See the remarks for details."
} as const;

export type ClaimStatus = ClaimStageKey | "rejected";

export function stageIndex(status: ClaimStatus): number {
  return CLAIM_STAGES.findIndex((s) => s.key === status);
}

/* ── Upload constraints ──────────────────────────────────────────────────
   Kept here so the uploader and the review step agree on the same limits. */

export const CLAIM_PHOTO_MIN = 7;
export const CLAIM_PHOTO_MAX = 10;
export const CLAIM_PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const CLAIM_PHOTO_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/* ── Submission schema ───────────────────────────────────────────────────
   Mirrors the planned server-side `claimSubmissionSchema`. Split per step so
   the multi-step form can validate one step at a time. */

export const claimCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Enter a valid phone number (10–15 digits)."),
  email: z
    .email("Enter a valid email address.")
    .max(160, "Email is too long."),
  companyName: z
    .string()
    .trim()
    .max(160, "Company name is too long.")
    .optional()
    .or(z.literal(""))
});

export const claimTyreSchema = z.object({
  brand: z.string().trim().min(1, "Select the tyre brand."),
  tyreSize: z
    .string()
    .trim()
    .min(2, "Enter the tyre size.")
    .max(40, "Tyre size is too long."),
  tyrePattern: z
    .string()
    .trim()
    .max(80, "Pattern is too long.")
    .optional()
    .or(z.literal("")),
  tyreSerialNumber: z
    .string()
    .trim()
    .max(60, "Serial number is too long.")
    .optional()
    .or(z.literal("")),
  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Enter the invoice number.")
    .max(60, "Invoice number is too long."),
  invoiceDate: z.string().trim().min(1, "Select the invoice date."),
  customerRemarks: z
    .string()
    .trim()
    .max(1200, "Please keep the description under 1200 characters.")
    .optional()
    .or(z.literal(""))
});

export type ClaimCustomerValues = z.infer<typeof claimCustomerSchema>;
export type ClaimTyreValues = z.infer<typeof claimTyreSchema>;

export type ClaimSubmission = ClaimCustomerValues &
  ClaimTyreValues & { photos: File[] };

export const CLAIM_BRAND_OPTIONS = ["Maxam", "Bridgestone", "Michelin"] as const;

/* ── Claim number ────────────────────────────────────────────────────────
   Format: KTH-YYMM-XXXX. The real claim number comes from the server; the
   stub generates one locally in the same shape. */

function generateClaimNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `KTH-${yy}${mm}-${seq}`;
}

export type SubmitClaimResult = { claimNumber: string };

export async function submitClaim(
  submission: ClaimSubmission
): Promise<SubmitClaimResult> {
  if (USE_REAL_API) {
    // Photos would first be uploaded to R2 via /api/web/claims/uploads, then
    // their keys sent here. Left for the backend integration pass.
    const res = await fetch(`${API_BASE}/api/web/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: submission.customerName,
        phone: submission.phone,
        email: submission.email,
        companyName: submission.companyName || undefined,
        brand: submission.brand,
        tyreSize: submission.tyreSize,
        tyrePattern: submission.tyrePattern || undefined,
        tyreSerialNumber: submission.tyreSerialNumber || undefined,
        invoiceNumber: submission.invoiceNumber,
        invoiceDate: submission.invoiceDate,
        customerRemarks: submission.customerRemarks || undefined
      })
    });

    if (!res.ok) {
      throw new Error("Failed to submit claim.");
    }

    const json = (await res.json()) as { claimNumber: string };
    return { claimNumber: json.claimNumber };
  }

  // Stubbed path — simulate network latency and return a mock claim number.
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { claimNumber: generateClaimNumber() };
}

/* ── Tracking ────────────────────────────────────────────────────────────── */

export type ClaimTrackResult = {
  claimNumber: string;
  status: ClaimStatus;
  submittedAt: string; // ISO
  updatedAt: string; // ISO
  // Only present when rejected — mirrors the admin remarks the API would send.
  remarks?: string;
};

const claimNumberPattern = /^KTH-\d{4}-\d{4}$/i;

export function isValidClaimNumber(value: string): boolean {
  return claimNumberPattern.test(value.trim());
}

export class ClaimNotFoundError extends Error {
  constructor() {
    super("Claim not found.");
    this.name = "ClaimNotFoundError";
  }
}

export async function trackClaim(
  claimNumberInput: string
): Promise<ClaimTrackResult> {
  const claimNumber = claimNumberInput.trim().toUpperCase();

  if (USE_REAL_API) {
    const res = await fetch(
      `${API_BASE}/api/web/claims/track?claimNumber=${encodeURIComponent(claimNumber)}`
    );
    if (res.status === 404) {
      throw new ClaimNotFoundError();
    }
    if (!res.ok) {
      throw new Error("Failed to look up claim.");
    }
    return (await res.json()) as ClaimTrackResult;
  }

  // Stubbed path — derive a deterministic-but-illustrative status from the
  // trailing digits so the same claim number always returns the same result.
  await new Promise((resolve) => setTimeout(resolve, 700));

  const digits = claimNumber.slice(-4);
  const bucket = Number(digits) % 5; // 0..4 → four stages + rejected

  const now = Date.now();
  const submittedAt = new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString();
  const updatedAt = new Date(now - 1000 * 60 * 60 * 6).toISOString();

  if (bucket === 4) {
    return {
      claimNumber,
      status: "rejected",
      submittedAt,
      updatedAt,
      remarks:
        "On inspection, the damage was found to be caused by external impact, which falls outside the manufacturer warranty."
    };
  }

  const status = CLAIM_STAGES[bucket].key;
  return { claimNumber, status, submittedAt, updatedAt };
}
