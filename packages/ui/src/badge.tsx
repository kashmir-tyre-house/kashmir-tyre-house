import * as React from "react";

import { cn } from "./utils";

type BadgeTone = "neutral" | "accent" | "success" | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClassName: Record<BadgeTone, string> = {
  neutral:
    "border-[var(--border)] bg-[var(--surface-container)] text-[var(--on-surface-variant)]",
  accent:
    "border-[var(--primary-fixed-dim)] bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning:
    "border-[var(--primary-fixed-dim)] bg-[var(--surface-container-low)] text-[var(--on-primary-container)]"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClassName[tone],
        className
      )}
      {...props}
    />
  );
}
