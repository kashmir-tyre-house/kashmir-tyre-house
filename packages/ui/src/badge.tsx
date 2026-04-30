import * as React from "react";

import { cn } from "./utils";

type BadgeTone = "neutral" | "accent" | "success" | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClassName: Record<BadgeTone, string> = {
  neutral: "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
  accent: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800"
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
