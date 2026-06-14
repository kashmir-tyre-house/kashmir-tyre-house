"use client";

import { ArrowRight, PackageOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEnquiryProducts } from "../lib/enquiry";

// Floating action bar that surfaces the running enquiry count and links to the
// contact page. Lets shoppers stack multiple products from the listing without
// leaving the page, then check out in one place.
export function EnquiryBar() {
  const pathname = usePathname();
  const { items, hydrated } = useEnquiryProducts();
  const count = hydrated ? items.length : 0;

  // Hide when empty, or on the contact page where the list is already shown.
  if (count === 0 || pathname === "/contact") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <Link
        href="/contact"
        className="group pointer-events-auto inline-flex h-12 items-center gap-3 rounded-full border border-[#ffffff]/10 bg-[#231a12] pl-3 pr-5 text-[13px] font-bold text-[#fff8f5] shadow-[0_18px_44px_rgba(35,26,18,0.32)] transition-all duration-300 hover:bg-[#3a2f25] hover:shadow-[0_22px_52px_rgba(35,26,18,0.4)]"
      >
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_40%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-3 text-[#231a12]">
          <PackageOpen aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
          {count}
        </span>
        Send enquiry
        <ArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={2.5}
        />
      </Link>
    </div>
  );
}
