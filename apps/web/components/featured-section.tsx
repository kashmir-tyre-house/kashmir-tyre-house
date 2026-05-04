import { Raleway } from "next/font/google";

import { featuredProducts } from "../lib/products";
import { ProductCard } from "./product-card";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

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
          <ArrowIcon />
        </button>
      </div>

      <div className="mx-auto mt-10 max-w-330">
        <div
          className="flex h-fit snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain bg-[#f9eee4] pb-10 outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:hidden"
          style={{
            WebkitOverflowScrolling: "touch",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.productName} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
