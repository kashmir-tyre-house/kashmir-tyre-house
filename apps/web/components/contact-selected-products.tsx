"use client";

import Image from "next/image";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { Raleway } from "next/font/google";

import type { Product } from "../lib/products";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

type ContactSelectedProductsProps = {
  initialProducts: Product[];
};

export function ContactSelectedProducts({
  initialProducts
}: ContactSelectedProductsProps) {
  const [selectedProducts, setSelectedProducts] = useState(initialProducts);

  function handleRemove(productName: string) {
    setSelectedProducts((currentProducts) =>
      currentProducts.filter((product) => product.productName !== productName)
    );
  }

  return (
    <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-22">
      <div className="rounded-[24px] border border-[#ead9c9] bg-white p-6 shadow-[0_18px_46px_rgba(35,26,18,0.06)]">
        <div className="flex items-center justify-between">
          <h2
            className={`${raleway.className} text-[17px] font-semibold tracking-[-0.03em] text-[#231a12]`}
          >
            Selected Products
          </h2>
          <span className="rounded-full bg-[#fff1de] px-2.5 py-1 text-[11px] font-semibold text-[#a06000]">
            {selectedProducts.length} items
          </span>
        </div>

        {selectedProducts.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {selectedProducts.map((product) => (
              <li
                className="group relative flex gap-3.5 rounded-[16px] border border-[#f0dfd1] bg-[#fffcfa] p-2 pr-13 transition-shadow duration-300"
                key={product.productName}
              >
                <div className="relative h-[72px] w-[80px] shrink-0 overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_50%_45%,rgba(246,147,0,0.14),transparent_38%),linear-gradient(180deg,#fff7ef_0%,#ead8c8_100%)]">
                  <Image
                    alt={`${product.brand} ${product.productName}`}
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={product.image}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold tracking-[0.18em] text-[#8a5100]">
                    {product.brand.toUpperCase()}
                  </p>
                  <h3 className="mt-0.5 text-[14px] font-bold leading-[1.2] tracking-[-0.025em] text-[#231a12]">
                    {product.productName}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-[11px] font-semibold text-[#8b7a6c]">
                      {product.primarySize}
                    </span>
                    <span className="text-[11px] text-[#c0ac9e]">·</span>
                    <span className="text-[11px] font-semibold text-[#8b7a6c]">
                      {product.vehicleType}
                    </span>
                  </div>
                </div>

                <button
                  aria-label={`Remove ${product.productName} from enquiry`}
                  className="absolute right-3 top-3 inline-flex items-center justify-center text-[#8b7a6c] transition-colors duration-300 hover:border-[#d8b997] hover:text-[#231a12]"
                  onClick={() => handleRemove(product.productName)}
                  type="button"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-[18px] border border-dashed border-[#e2cfbf] bg-[#fbf1e6] p-5 text-center">
            <p className="text-[13px] leading-[1.75] text-[#6f6258]">
              No products selected in your enquiry list yet.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-dashed border-[#d9c4ae] bg-[#fdf5ec] p-5">
        <p className="text-[13px] leading-[1.75] text-[#6f6258]">
          Need more options? Browse and shortlist additional tyres before
          submitting.
        </p>
        <button
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-[#231a12]/18 bg-white px-4 text-[12px] font-bold text-[#231a12] shadow-[0_2px_8px_rgba(35,26,18,0.06)] transition-all duration-300 hover:border-[#231a12] hover:bg-[#231a12] hover:text-[#fff8f5]"
          type="button"
        >
          Browse products
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}
