import { getFeatureFlags } from "@kth/config";
import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";

import { EnquiryBar } from "../components/enquiry-bar";
import { Toaster } from "../components/toaster";
import { WorkInProgressModal } from "../components/work-in-progress-modal";
import { FeatureFlagsProvider } from "../lib/features";
import { Providers } from "./providers";
import "./globals.css";

const display = Figtree({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap"
});

const sans = Inter({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Kashmir Tyre House | Premium Tyre Enquiries",
  description:
    "Browse tyres, shortlist products, and send quick enquiries to Kashmir Tyre House.",
  metadataBase: new URL("https://kashmir-tyre-house.vercel.app")
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  // Resolved on the server, then shared with client components via context.
  const flags = getFeatureFlags();

  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <FeatureFlagsProvider flags={flags}>
          <Providers>{children}</Providers>
          {flags.enquiries ? <EnquiryBar /> : null}
          <WorkInProgressModal />
          <Toaster />
        </FeatureFlagsProvider>
      </body>
    </html>
  );
}
