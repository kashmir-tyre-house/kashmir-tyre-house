import { isFeatureEnabled } from "@kth/config";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaimTracker } from "../../../components/claim-tracker";
import { Reveal } from "../../../components/reveal";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Track a Claim | Kashmir Tyre House",
  description:
    "Track your tyre warranty claim in real time using your unique claim number."
};

export default async function TrackClaimPage({
  searchParams
}: {
  searchParams: Promise<{ claimNumber?: string }>;
}) {
  if (!isFeatureEnabled("claims")) {
    notFound();
  }

  const { claimNumber } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f9eee4] text-[#231a12]">
      <SiteHeader />

      <section className="px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-[880px]">
          <Reveal distance="sm">
            <Link
              href="/claims"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8b7a6c] no-underline transition-colors hover:text-[#a85d00]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Back to Claims
            </Link>

            <h1
              className={`${raleway.className} mt-4 text-[clamp(1.75rem,6vw,3rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#231a12]`}
            >
              Track your <em className="not-italic text-[#c07000]">claim.</em>
            </h1>
            <p className="mt-3 max-w-lg text-[13.5px] font-medium leading-[1.7] text-[#6f6258] sm:text-[14.5px]">
              Enter the claim number from your confirmation to see the latest
              status.
            </p>
          </Reveal>

          <Reveal delayMs={120} distance="sm">
            <div className="mt-8 rounded-[20px] border border-[#ead9c9] bg-white p-5 shadow-[0_10px_32px_rgba(35,26,18,0.05)] sm:p-7">
              <ClaimTracker initialClaimNumber={claimNumber ?? ""} />
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
