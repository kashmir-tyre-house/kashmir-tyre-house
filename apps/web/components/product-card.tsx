"use client";

import Image from "next/image";
import { Button } from "@kth/ui";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Bookmark, Check, Plus } from "lucide-react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getBookmarkKey, useBookmarks } from "../lib/bookmarks";
import { getCompareKey, useCompare } from "../lib/compare";
import { addToEnquiry } from "../lib/enquiry";
import type { Product } from "../lib/products";

const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

type ProductCardProps = {
  product: Product;
  className?: string;
};

function StarRating({ rating }: { rating: number }) {
  const filledStars = Math.round(rating);

  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-[#f69300]">
        {Array.from({ length: 5 }).map((_, index) => (
          <svg
            key={index}
            aria-hidden="true"
            className={[
              "h-3.5 w-3.5",
              index < filledStars ? "fill-current" : "fill-transparent"
            ].join(" ")}
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="m12 3.8 2.55 5.17 5.7.83-4.12 4.02.97 5.68L12 16.8l-5.1 2.7.97-5.68-4.12-4.02 5.7-.83L12 3.8Z" />
          </svg>
        ))}
      </div>
      <span className="text-[11px] font-semibold tracking-[0.02em] text-[#8b7a6c]">
        {rating.toFixed(1)} / 5
      </span>
    </div>
  );
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const { isBookmarked, toggle, hydrated } = useBookmarks();
  const saved = hydrated && isBookmarked(getBookmarkKey(product));

  const {
    isInCompare,
    isFull: isCompareFull,
    toggle: toggleCompare,
    hydrated: compareHydrated,
  } = useCompare();
  const comparing = compareHydrated && isInCompare(getCompareKey(product));
  const compareDisabled = !product.id || (!comparing && isCompareFull);

  const handleEnquire = () => {
    addToEnquiry(product);
    router.push("/contact");
  };

  const handleDetails = () => {
    if (!product.id) return;
    router.push(`/products/${product.id}`);
  };

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDetails();
    }
  };

  return (
    <article
      aria-label={product.id ? `View ${product.brand} ${product.productName} details` : undefined}
      className={`${inter.className} group h-fit min-w-[312px] max-w-[372px] w-fit flex-none snap-start overflow-hidden rounded-[22px] border border-[#ead9c9] bg-white shadow-[0_14px_44px_rgba(35,26,18,0.07)] transition-[border-color,box-shadow] duration-300 hover:border-[#d8b997] focus-visible:border-[#a85d00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a85d00]/20 ${product.id ? "cursor-pointer" : ""} ${className}`}
      onClick={product.id ? handleDetails : undefined}
      onKeyDown={product.id ? handleCardKeyDown : undefined}
      role={product.id ? "link" : undefined}
      tabIndex={product.id ? 0 : undefined}
    >
      <div className="relative rounded-[20px] bg-[#c0b3a6] p-2">
        <div className="relative flex h-[160px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_45%,rgba(246,147,0,0.14),transparent_38%),linear-gradient(180deg,#fff7ef_0%,#ead8c8_100%)]">
          {!loaded ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="w-20">
                <DotLottieReact autoplay loop src="/lottie/loading-animation.lottie" />
              </div>
            </div>
          ) : null}
          <Image
            alt={`${product.brand} ${product.productName}`}
            className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            fill
            onError={() => setLoaded(true)}
            onLoad={() => setLoaded(true)}
            sizes="(min-width: 1280px) 260px, (min-width: 768px) 45vw, 92vw"
            src={product.image}
          />

          <span className="absolute bottom-2.5 left-2.5 z-20 inline-flex items-center rounded-[6px] border border-[#F3E7DB]/40 bg-white/30 px-2.5 py-0.5 backdrop-blur-md">
            <span className="text-[9px] font-medium tracking-[0.1em] text-[#f9eee4]">
              {product.brand}
            </span>
          </span>
        </div>
      </div>

      <div className="p-4 hover:cursor-pointer">
        <div className="flex items-center justify-between gap-3">
          <h3
            className="whitespace-nowrap text-[16px] font-bold leading-[1.12] tracking-[-0.035em] text-[#231a12]"
            title={product.productName}
          >
            {product.productName.length > 24
              ? `${product.productName.slice(0, 22)}…`
              : product.productName}
          </h3>

          <button
            aria-label={saved ? `Remove ${product.productName} from saved` : `Save ${product.productName}`}
            aria-pressed={saved}
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#F3E7DB] shadow-[0_8px_20px_rgba(35,26,18,0.08)] transition-colors duration-300 hover:text-[#f69300] ${saved ? "text-[#f69300]" : "text-[#231a12]"}`}
            onClick={(e) => {
              stop(e);
              toggle(product);
            }}
            type="button"
          >
            <Bookmark
              aria-hidden="true"
              className="h-3.5 w-3.5"
              fill={saved ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        </div>

        <StarRating rating={product.starRating} />

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
          <div>
            <p className="text-[10px] font-semibold text-[#8b7a6c]">Tyre Size</p>
            <p className="mt-1 whitespace-nowrap text-[13px] font-bold leading-tight text-[#231a12]">
              {product.primarySize}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#8b7a6c]">Vehicle Type</p>
            <p className="mt-1 whitespace-nowrap text-[13px] font-semibold leading-tight text-[#231a12]">
              {product.vehicleType}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#8b7a6c]">Load Index</p>
            <p className="mt-1 whitespace-nowrap text-[13px] font-bold leading-tight text-[#231a12]">
              {product.loadIndex}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#8b7a6c]">Ply Rating</p>
            <p className="mt-1 whitespace-nowrap text-[13px] font-semibold leading-tight text-[#231a12]">
              {product.plyRating}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            className="h-9 flex-1 rounded-md bg-[linear-gradient(135deg,#ffae2b_0%,#f69300_42%,#a85d00_100%)] px-3 text-[12px] font-extrabold text-[#231a12] shadow-[0_10px_22px_rgba(246,147,0,0.2)] transition-[transform,filter,box-shadow] duration-300 hover:brightness-110 hover:shadow-[0_14px_28px_rgba(246,147,0,0.28)]"
            onClick={(e) => {
              stop(e);
              handleEnquire();
            }}
            size="sm"
          >
            Enquire
          </Button>

          <Button
            aria-label={
              comparing
                ? `Remove ${product.productName} from compare`
                : isCompareFull
                  ? "Compare list is full (3 max)"
                  : `Add ${product.productName} to compare`
            }
            aria-pressed={comparing}
            className={`h-9 rounded-md px-3 text-[12px] font-bold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
              comparing
                ? "border border-[#a85d00] bg-[#fff1e3] text-[#a85d00] hover:bg-[#ffe6d0]"
                : "border border-[#231a12]/20 bg-transparent text-[#231a12] hover:bg-white"
            }`}
            disabled={compareDisabled}
            onClick={(e) => {
              stop(e);
              toggleCompare(product);
            }}
            size="sm"
            title={!comparing && isCompareFull ? "Compare list is full (3 max)" : undefined}
            variant="secondary"
          >
            {comparing ? (
              <>
                <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
                Comparing
              </>
            ) : (
              <>
                <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
                Compare
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
