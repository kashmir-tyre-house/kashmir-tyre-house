import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "KTH Admin | Kashmir Tyre House",
  description: "Admin portal for Kashmir Tyre House product enquiries."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
