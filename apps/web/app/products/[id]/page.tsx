"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ArrowRight, Bookmark, ChevronLeft, Loader2, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Karla, Raleway } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";
import { getBookmarkKey, useBookmarks } from "../../../lib/bookmarks";
import { addToEnquiry } from "../../../lib/enquiry";
import type { Product } from "../../../lib/products";

const karla = Karla({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const FALLBACK_IMAGE = "/images/placeholder-image.jpg";

type ApiProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  pattern: string;
  tyreSize: string;
  tyreWeight: number | null;
  application: string;
  vehicleType: string | null;
  tyreType: string | null;
  starRating: string | null;
  plyRating: string | null;
  loadIndex: string | null;
  rim: string | null;
  treadDepth: string | null;
  tyreFeatures: string[];
  createdAt: string;
  brand: { id: string; name: string; logoUrl: string | null } | null;
  images: Array<{ id: string; url: string; imageType: "hero" | "gallery"; isPrimaryImage: boolean }>;
};

type ApiResponse = { ok: true; data: ApiProduct } | { ok: false; message: string };

function StarRow({ rating }: { rating: number }) {
  const filledStars = Math.round(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-[#f69300]">
        {Array.from({ length: filledStars }).map((_, i) => (
          <svg
            aria-hidden="true"
            className="h-4 w-4 fill-current"
            key={i}
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="m12 3.8 2.55 5.17 5.7.83-4.12 4.02.97 5.68L12 16.8l-5.1 2.7.97-5.68-4.12-4.02 5.7-.83L12 3.8Z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a5100]/70">
        {label}
      </p>
      <p className={`${karla.className} mt-1.5 text-[15px] font-semibold text-[#231a12]`}>
        {value && value.trim() !== "" ? value : "—"}
      </p>
    </div>
  );
}

function toProduct(p: ApiProduct): Product {
  const primary = p.images.find((img) => img.isPrimaryImage) ?? p.images[0];
  return {
    id: p.id,
    brand: p.brand?.name ?? "—",
    category: p.category ?? "Tyre",
    productName: p.name,
    primarySize: p.tyreSize,
    availableSizesCount: 1,
    vehicleType: p.vehicleType ?? "—",
    loadIndex: p.loadIndex ?? "—",
    plyRating: p.plyRating ?? "—",
    starRating: p.starRating ? Number.parseFloat(p.starRating) || 0 : 0,
    image: primary?.url ?? FALLBACK_IMAGE,
    isBookmarked: false,
  };
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isBookmarked, toggle, hydrated } = useBookmarks();
  const saved = useMemo(
    () => (product && hydrated ? isBookmarked(getBookmarkKey({ id: product.id, productName: product.name })) : false),
    [product, hydrated, isBookmarked]
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/web/products/${id}`);
        const json = (await res.json()) as ApiResponse;
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          throw new Error(("message" in json && json.message) || "Failed to load product.");
        }
        // Sort: primary image first, then by id for stability.
        const sortedImages = [...json.data.images].sort((a, b) => {
          if (a.isPrimaryImage === b.isPrimaryImage) return 0;
          return a.isPrimaryImage ? -1 : 1;
        });
        setProduct({ ...json.data, images: sortedImages });
        setActiveImageIndex(0);
        setImageLoaded(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f9eee4] text-[#231a12]">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-32">
            <DotLottieReact autoplay loop src="/lottie/loading-animation.lottie" />
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f9eee4] text-[#231a12]">
        <SiteHeader />
        <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <h2 className={`${raleway.className} text-[28px] font-medium tracking-[-0.03em] text-[#231a12]`}>
            Product not available
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-[1.8] text-[#6f6258]">
            {error ?? "The product you're looking for doesn't exist or is no longer available."}
          </p>
          <Link
            className="mt-7 inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#231a12] px-5 text-[13px] font-bold text-white transition hover:bg-[#3a2f25]"
            href="/#tyres"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
            Back to products
          </Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const activeImage = product.images[activeImageIndex] ?? null;
  const reviewsRating = product.starRating ? Number.parseFloat(product.starRating) || 0 : 0;
  const tyreWeight = product.tyreWeight ? `${product.tyreWeight} kg` : null;

  const handleEnquire = () => {
    addToEnquiry(toProduct(product));
    router.push("/contact");
  };

  const handleBookmark = () => {
    toggle(toProduct(product));
  };

  return (
    <main className={`${karla.className} bg-[#f9eee4] text-[#231a12]`}>
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 !h-screen">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[12px] font-semibold text-[#8b7a6c]">
          <Link className="transition-colors hover:text-[#231a12]" href="/">
            Home
          </Link>
          <span className="text-[#c0ac9e]">/</span>
          <Link className="transition-colors hover:text-[#231a12]" href="/#tyres">
            Products
          </Link>
          <span className="text-[#c0ac9e]">/</span>
          <span className="truncate text-[#231a12]">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          {/* ── Left: Image gallery ───────────────────────────── */}
          <div>
            <div className="relative aspect-square w-[85%] overflow-hidden rounded-[20px] border border-[#ead9c9] bg-[radial-gradient(circle_at_50%_45%,rgba(246,147,0,0.10),transparent_42%),linear-gradient(180deg,#fff7ef_0%,#f0e0cf_100%)] shadow-[0_18px_46px_rgba(35,26,18,0.06)]">
              {!imageLoaded ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="w-32">
                    <DotLottieReact autoplay loop src="/lottie/loading-animation.lottie" />
                  </div>
                </div>
              ) : null}
              <Image
                alt={`${product.brand?.name ?? ""} ${product.name}`}
                className="object-contain p-4 rounded-3xl"
                fill
                key={activeImage?.id ?? "fallback"}
                onError={() => setImageLoaded(true)}
                onLoad={() => setImageLoaded(true)}
                priority
                quality={50}
                sizes="(min-width: 1024px) 420px, 100vw"
                src={activeImage?.url ?? FALLBACK_IMAGE}
              />
            </div>

            {product.images.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:gap-4 w-[85%]">
                {product.images.slice(0, 4).map((img, i) => {
                  const active = i === activeImageIndex;
                  return (
                    <button
                      aria-label={`Show image ${i + 1}`}
                      className={`relative aspect-square overflow-hidden rounded-[14px] border-2 bg-[linear-gradient(180deg,#fff7ef_0%,#f0e0cf_100%)] transition-all duration-300 ${
                        active
                          ? "border-[#f69300] shadow-[0_6px_18px_rgba(246,147,0,0.22)]"
                          : "border-[#ead9c9] hover:border-[#d8b997]"
                      }`}
                      key={img.id}
                      onClick={() => {
                        setActiveImageIndex(i);
                        setImageLoaded(false);
                      }}
                      type="button"
                    >
                      <Image
                        alt=""
                        className="object-contain p-1 rounded-[12px]"
                        fill
                        sizes="120px"
                        src={img.url}
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* ── Right: Details ─────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Brand */}
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#c07000]">
              {product.brand?.name ?? "—"}
            </p>

            {/* Name */}
            <h1
              className={`${raleway.className} mt-2 text-[32px] font-bold uppercase leading-[1.05] tracking-[-0.02em] text-[#231a12] sm:text-[40px] lg:text-[44px]`}
            >
              {product.name}
            </h1>

            {/* Specifications */}
            <div className="mt-8 border-t border-[#ead9c9] pt-6">
              <p className={`${raleway.className} text-[14px] font-bold uppercase tracking-[0.14em] text-[#231a12]`}>
                Specifications
              </p>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <SpecCell label="Tyre Size" value={product.tyreSize} />
                <SpecCell label="Vehicle Type" value={product.vehicleType} />
                <SpecCell label="Category" value={product.category} />
                <SpecCell label="Load Index" value={product.loadIndex} />
                <SpecCell label="Rim" value={product.rim} />
                <SpecCell label="Tread Depth" value={product.treadDepth} />
                <SpecCell label="Pattern" value={product.pattern} />
                <SpecCell label="Application" value={product.application} />
                <SpecCell label="Tyre Type" value={product.tyreType} />
                {tyreWeight ? <SpecCell label="Tyre Weight" value={tyreWeight} /> : null}
              </div>
            </div>

            {/* Ratings */}
            <div className="mt-8 border-t border-[#ead9c9] pt-6">
              <p className={`${raleway.className} text-[14px] font-bold uppercase tracking-[0.14em] text-[#231a12]`}>
                Ratings
              </p>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <SpecCell label="Ply Rating" value={product.plyRating} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a5100]/70">
                    Star Rating
                  </p>
                  <div className={`${karla.className} mt-1.5 text-[15px] font-semibold text-[#231a12]`}>
                    {reviewsRating > 0 ? (
                      <StarRow rating={reviewsRating} />
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description ? (
              <div className="mt-8 border-t border-[#ead9c9] pt-6">
                <p className={`${raleway.className} text-[14px] font-bold uppercase tracking-[0.14em] text-[#231a12]`}>
                  Product Description
                </p>
                <p className="mt-4 text-[14px] leading-[1.85] text-[#6f6258]">
                  {product.description}
                </p>
              </div>
            ) : null}

            {/* Tyre Features */}
            {product.tyreFeatures && product.tyreFeatures.length > 0 ? (
              <div className="mt-8 border-t border-[#ead9c9] pt-6">
                <p className={`${raleway.className} text-[14px] font-bold uppercase tracking-[0.14em] text-[#231a12]`}>
                  Key Features
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tyreFeatures.map((feature) => (
                    <span
                      className="inline-flex items-center rounded-full border border-[#ead9c9] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#544434]"
                      key={feature}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* CTA row */}
            <div className="mt-8 flex items-center gap-3">
              <button
                className="group inline-flex h-12 flex-1 items-center justify-center gap-2.5 rounded-[14px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[14px] font-bold text-white shadow-[0_14px_34px_rgba(246,147,0,0.28)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_18px_40px_rgba(246,147,0,0.36)]"
                onClick={handleEnquire}
                type="button"
              >
                Add to Enquiry
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
              <button
                aria-label={saved ? "Remove from saved" : "Save"}
                aria-pressed={saved}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border bg-white shadow-[0_8px_20px_rgba(35,26,18,0.06)] transition-colors duration-300 ${
                  saved ? "border-[#f69300] text-[#f69300]" : "border-[#ead9c9] text-[#231a12] hover:text-[#f69300]"
                }`}
                onClick={handleBookmark}
                type="button"
              >
                <Bookmark
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill={saved ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
            </div>

          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
