import { ArrowDown, ArrowRight, ArrowBigDown } from "lucide-react";
import { Raleway } from "next/font/google";

import { featuredProducts } from "../lib/products";
import { BlurText } from "./blur-text";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";

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
      className="px-4 pt-20 text-[#231a12] sm:px-6 lg:px-8"
      id="tyres"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className={`${raleway.className} mb-10 mt-3 place-self-center font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px]`}
          id="services-heading"
        >
          <BlurText text="Featured Products" delay={150} />
        </h2>
      </div>

      <Reveal className="mt-3 flex flex-col items-center gap-6 text-center" delayMs={70}>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#231a12]/25 bg-transparent px-5 text-[13px] font-bold text-[#231a12] transition-all duration-300 hover:border-[#231a12] hover:bg-[#231a12] hover:text-[#fff8f5]"
          type="button"
        >
          View all products
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </Reveal>

      <div className="mx-auto mt-10 max-w-330">
        <div className="relative pb-15">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <Reveal
                className="h-full"
                delayMs={index * 55}
                distance="sm"
                key={product.productName}
              >
                <ProductCard
                  className="!min-w-0 !w-full !flex-auto !snap-none"
                  product={product}
                />
              </Reveal>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-[linear-gradient(180deg,rgba(249,238,228,0)_0%,rgba(249,238,228,0.64)_38%,rgba(249,238,228,0.9)_68%,#f9eee4_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex justify-center">
            <div className="h-16 w-64 rounded-full bg-[radial-gradient(circle,rgba(246,147,0,0.18)_0%,rgba(246,147,0,0.08)_42%,transparent_72%)] blur-2xl" />
          </div>

          <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center transition-transform hover:translate-y-0.5">
            <button type="button" className="w-12">
              <ArrowBigDown aria-hidden="true" className="mx-auto h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
