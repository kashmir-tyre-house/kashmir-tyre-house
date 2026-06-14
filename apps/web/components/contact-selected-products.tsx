"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageOpen, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Raleway } from "next/font/google";

import { getBookmarkKey } from "../lib/bookmarks";
import { useEnquiryProducts } from "../lib/enquiry";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

export function ContactSelectedProducts() {
  const { items, hydrated, remove } = useEnquiryProducts();
  const [removingKeys, setRemovingKeys] = useState<string[]>([]);
  const removalTimeouts = useRef<Record<string, number>>({});

  function handleRemove(key: string) {
    if (removingKeys.includes(key)) return;

    setRemovingKeys((curr) => [...curr, key]);

    removalTimeouts.current[key] = window.setTimeout(() => {
      remove(key);
      setRemovingKeys((curr) => curr.filter((k) => k !== key));
      delete removalTimeouts.current[key];
    }, 280);
  }

  useEffect(() => {
    const pendingTimeouts = removalTimeouts.current;
    return () => {
      Object.values(pendingTimeouts).forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
    };
  }, []);

  return (
    <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-22">
      <div className="overflow-hidden rounded-[20px] border border-[#ead9c9] bg-white shadow-[0_10px_32px_rgba(35,26,18,0.05)]">
        {/* Header strip */}
        <div className="flex items-center justify-between gap-3 border-b border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#fff1e3] text-[#a85d00]">
              <PackageOpen aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
            </span>
            <h2
              className={`${raleway.className} text-[14px] font-bold tracking-[-0.01em] text-[#231a12]`}
            >
              Selected Products
            </h2>
          </div>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#231a12] px-1.5 text-[10px] font-bold text-[#fff8f5]">
            {hydrated ? items.length : 0}
          </span>
        </div>

        {/* Body */}
        <div className="p-3">
          {!hydrated ? (
            <div className="h-20" />
          ) : items.length > 0 ? (
            <ul className="flex flex-col">
              {items.map((product) => {
                const key = getBookmarkKey(product);
                const removing = removingKeys.includes(key);
                return (
                  <li
                    className={[
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                      removing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
                    ].join(" ")}
                    key={key}
                  >
                    <div className="overflow-hidden">
                    <div
                      className={[
                        "group relative mb-2 flex gap-3 rounded-[12px] border border-transparent bg-white p-2 pr-9",
                        "transition-[transform,opacity,border-color,background-color] duration-300 ease-out motion-reduce:transition-none",
                        "hover:border-[#ead9c9] hover:bg-[#fffbf7]",
                        removing ? "translate-x-4 opacity-0" : "translate-x-0 opacity-100",
                      ].join(" ")}
                    >
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[8px] border border-[#ead9c9]/60 bg-[radial-gradient(circle_at_50%_45%,rgba(246,147,0,0.12),transparent_42%),linear-gradient(180deg,#fff7ef_0%,#ead8c8_100%)]">
                        <Image
                          alt={`${product.brand} ${product.productName}`}
                          className="object-contain p-1.5 rounded-[10px]"
                          fill
                          sizes="72px"
                          src={product.image}
                          priority
                          quality={50}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c07000]">
                          {product.brand}
                        </p>
                        <h3 className="mt-0.5 line-clamp-1 text-[13px] font-bold leading-tight tracking-[-0.02em] text-[#231a12]">
                          {product.productName}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-[#8b7a6c]">
                            {product.primarySize}
                          </span>
                          <span className="inline-block h-1 w-1 rounded-full bg-[#d8c4b3]" />
                          <span className="line-clamp-1 text-[11px] font-medium text-[#8b7a6c]">
                            {product.vehicleType}
                          </span>
                        </div>
                      </div>

                      <button
                        aria-label={`Remove ${product.productName} from enquiry`}
                        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[#8b7a6c] opacity-0 transition-all duration-200 hover:border-[#ead9c9] hover:bg-white hover:text-[#a85d00] focus-visible:opacity-100 group-hover:opacity-100 disabled:pointer-events-none"
                        disabled={removing}
                        onClick={() => handleRemove(key)}
                        type="button"
                      >
                        <X aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-[12px] border border-dashed border-[#ead9c9] bg-[#fffbf7] px-5 py-8 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ead9c9] bg-white text-[#a85d00]">
                <PackageOpen aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-3 text-[12.5px] font-semibold text-[#231a12]">
                No products selected yet
              </p>
              <p className="mt-1 max-w-xs text-[11.5px] leading-[1.65] text-[#8b7a6c]">
                Add tyres from the catalogue to include them with your enquiry.
              </p>
              <Link
                className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-full border border-[#231a12]/15 bg-white px-3 text-[11px] font-bold text-[#231a12] transition-colors duration-200 hover:border-[#a85d00] hover:bg-[#fff1e3] hover:text-[#a85d00]"
                href="/products"
              >
                Browse products
                <ArrowRight aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
              </Link>
            </div>
          )}
        </div>

        {/* Footer hint — only when products are present */}
        {hydrated && items.length > 0 ? (
          <div className="border-t border-[#ead9c9]/60 bg-[#fffbf7] px-5 py-3">
            <p className="text-[11px] leading-[1.6] text-[#8b7a6c]">
              These products will be attached to your enquiry. Remove any you
              don&apos;t want included.
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
