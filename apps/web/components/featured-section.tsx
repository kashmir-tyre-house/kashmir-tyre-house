import { ArrowDown, ArrowRight, ArrowBigDown } from "lucide-react";
import { Raleway } from "next/font/google";

import { featuredProducts } from "../lib/products";
import { ProductCard } from "./product-card";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

export function FeaturedSection() {
  return (
    <section
      aria-labelledby="featured-heading"
      className="px-4 text-[#231a12] sm:px-6 lg:px-8 lg:pt-16"
      id="tyres"
    >
      <h2
        className={`${raleway.className} mb-10 mt-3 place-self-center font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px]`}
        id="services-heading"
      >
        Featured Products
      </h2>

      <div className="mt-3 flex flex-col items-center gap-6 text-center">
        <h2
          className={`${raleway.className} max-w-2xl text-[26px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[32px] lg:text-[24px]`}
          id="featured-heading"
        >
          Tyres our customers keep coming back for.
        </h2>

        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#231a12]/25 bg-transparent px-5 text-[13px] font-bold text-[#231a12] transition-all duration-300 hover:border-[#231a12] hover:bg-[#231a12] hover:text-[#fff8f5]"
          type="button"
        >
          View all products
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="mx-auto mt-10 max-w-330">
        <div className="relative pb-15">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                className="!min-w-0 !w-full !flex-auto !snap-none"
                key={product.productName}
                product={product}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-[linear-gradient(180deg,rgba(249,238,228,0)_0%,rgba(249,238,228,0.64)_38%,rgba(249,238,228,0.9)_68%,#f9eee4_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex justify-center">
            <div className="h-16 w-64 rounded-full bg-[radial-gradient(circle,rgba(246,147,0,0.18)_0%,rgba(246,147,0,0.08)_42%,transparent_72%)] blur-2xl" />
          </div>

          <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center hover:translate-y-0.5 transition-transform p-2">
            <button
              type="button"
              className="w-12"
            >
              <ArrowBigDown aria-hidden="true" className="mx-auto h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
