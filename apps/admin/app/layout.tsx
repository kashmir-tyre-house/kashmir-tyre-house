import type { Metadata } from "next";
import { Montserrat, Playfair } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const display = Playfair({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap"
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
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
