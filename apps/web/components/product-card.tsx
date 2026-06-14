"use client";

import Image from "next/image";
import { Button } from "@kth/ui";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Bookmark, Check, Plus } from "lucide-react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";

import { getBookmarkKey, useBookmarks } from "../lib/bookmarks";
import { getCompareKey, useCompare } from "../lib/compare";
import { useEnquiryProducts } from "../lib/enquiry";
import type { Product } from "../lib/products";
import { StarBorder } from "./StarBorder";

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

type BadgeTheme = "light" | "dark";

/** Sample the average brightness of a small region at the bottom-left of the image */
function sampleRegionBrightness(
  img: HTMLImageElement,
  regionWidthPx = 120,
  regionHeightPx = 40
): number {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = regionWidthPx;
    canvas.height = regionHeightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 128;

    // Draw only the bottom-left slice of the image
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const srcX = 0;
    const srcY = (img.height - regionHeightPx) * scaleY;
    const srcW = regionWidthPx * scaleX;
    const srcH = regionHeightPx * scaleY;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, regionWidthPx, regionHeightPx);

    const { data } = ctx.getImageData(0, 0, regionWidthPx, regionHeightPx);
    let total = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Perceived luminance weights
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      count++;
    }
    return count > 0 ? total / count : 128;
  } catch {
    // Cross-origin images will throw — fall back to default
    return 128;
  }
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>("light");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const { isBookmarked, toggle, hydrated } = useBookmarks();
  const saved = hydrated && isBookmarked(getBookmarkKey(product));

  const {
    compare,
    isInCompare,
    isFull: isCompareFull,
    toggle: toggleCompare,
    hydrated: compareHydrated,
  } = useCompare();
  const comparing = compareHydrated && isInCompare(getCompareKey(product));
  const compareDisabled = !product.id || (!comparing && isCompareFull);

  const { has: hasEnquiry, toggle: toggleEnquiry, hydrated: enquiryHydrated } =
    useEnquiryProducts();
  const inEnquiry = enquiryHydrated && hasEnquiry(product);

  const handleCompareClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    stop(e);
    // Snapshot prior state so we know whether this click is an add (vs. remove)
    // and whether the resulting list will have 2+ items.
    const wasComparing = comparing;
    const previousCount = compare.length;
    toggleCompare(product);
    if (!wasComparing && previousCount >= 1) {
      router.push("/compare");
    }
  };

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    const img = e.currentTarget;
    imgRef.current = img;
    const brightness = sampleRegionBrightness(img);
    // Threshold: >140 = light background → use dark badge; ≤140 = dark → use light badge
    setBadgeTheme(brightness > 140 ? "dark" : "light");
  }, []);

  const handleEnquire = () => {
    toggleEnquiry(product);
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

  // Badge styles based on detected background brightness
  const badgeStyles =
    badgeTheme === "light"
      ? // Dark background under badge → light text, light-frosted bg
        "border-white/20 bg-white/20 backdrop-blur-md text-white"
      : // Light background under badge → dark text, dark-frosted bg
        "border-[#231a12]/15 bg-[#231a12]/60 backdrop-blur-md text-[#f9eee4]";

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
            className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            fill
            onError={() => setLoaded(true)}
            onLoad={handleImageLoad}
            sizes="(min-width: 1280px) 260px, (min-width: 768px) 45vw, 92vw"
            src={product.image}
          />

          {/* Brand badge — adapts to image brightness */}
          <span
            className={`absolute bottom-2.5 left-2.5 z-20 inline-flex items-center rounded-[6px] border px-2.5 py-0.5 transition-colors duration-300 ${badgeStyles}`}
          >
            <span className="text-[9px] font-medium tracking-[0.1em]">
              {product.brand}
            </span>
          </span>
        </div>
      </div>

      {/* Rest of card unchanged */}
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

        <div className="mt-5 flex gap-2 align-middle">
          <Button
            aria-pressed={inEnquiry}
            className={`h-9 flex-1 place-self-center rounded-md px-3 text-[12px] font-extrabold transition-[transform,filter,box-shadow] duration-300 ${
              inEnquiry
                ? "bg-[#fff1e3] text-[#a85d00] hover:bg-[#ffe6d0]"
                : "bg-[linear-gradient(135deg,#ffae2b_0%,#f69300_42%,#a85d00_100%)] text-[#231a12] shadow-[0_10px_22px_rgba(246,147,0,0.2)] hover:brightness-110 hover:shadow-[0_14px_28px_rgba(246,147,0,0.28)]"
            }`}
            onClick={(e) => { stop(e); handleEnquire(); }}
            size="sm"
          >
            {inEnquiry ? (
              <><Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />Added</>
            ) : (
              "Enquire"
            )}
          </Button>

          <StarBorder
            as="button"
            type="button"
            aria-label={
              comparing
                ? `Remove ${product.productName} from compare`
                : isCompareFull
                  ? "Compare list is full (3 max)"
                  : `Add ${product.productName} to compare`
            }
            aria-pressed={comparing}
            className={`compare-card${comparing ? " is-comparing" : ""}`}
            color="#ff8400"
            speed="3s"
            thickness={1.5}
            disabled={compareDisabled}
            onClick={handleCompareClick}
            title={!comparing && isCompareFull ? "Compare list is full (3 max)" : undefined}
          >
            {comparing ? (
              <><Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />Comparing</>
            ) : (
              <><Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />Compare</>
            )}
          </StarBorder>
        </div>
      </div>
    </article>
  );
}