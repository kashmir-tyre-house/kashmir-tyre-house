import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";

import { WorkInProgressModal } from "../components/work-in-progress-modal";
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
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <Providers>{children}</Providers>
        <WorkInProgressModal />
      </body>
    </html>
  );
}
