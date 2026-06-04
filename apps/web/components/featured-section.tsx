"use client";

import { ArrowBigDown, ArrowRight, Loader2 } from "lucide-react";
import { Raleway } from "next/font/google";
import { useEffect, useState } from "react";

import type { Product } from "../lib/products";
import { BlurText } from "./blur-text";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { Reveal } from "./reveal";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const PAGE_SIZE = 8;
const FALLBACK_IMAGE = "/images/placeholder-image.jpg";

type ApiProduct = {
  id: string;
  name: string;
  category: string | null;
  pattern: string;
  tyreSize: string;
  vehicleType: string | null;
  starRating: string | null;
  plyRating: string | null;
  loadIndex: string | null;
  brand: { id: string; name: string; logoUrl: string | null } | null;
  primaryImageUrl: string | null;
};

type ApiListResponse = {
  ok: boolean;
  data: ApiProduct[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
};

type CardProduct = Product & { id: string };

function mapApiToProduct(p: ApiProduct): CardProduct {
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
    image: p.primaryImageUrl ?? FALLBACK_IMAGE,
    isBookmarked: false,
  };
}

export function FeaturedSection() {
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/web/products?limit=${PAGE_SIZE}&page=1`
        );
        const json = (await res.json()) as ApiListResponse;
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          throw new Error(json.message ?? "Failed to load products.");
        }
        setProducts(json.data.map(mapApiToProduct));
        setTotalPages(json.pagination?.totalPages ?? 0);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasMore = page < totalPages;
  const isInitialLoad = loading && products.length === 0;

  const loadMore = async () => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/web/products?limit=${PAGE_SIZE}&page=${next}`
      );
      const json = (await res.json()) as ApiListResponse;
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "Failed to load products.");
      }
      setProducts((prev) => [...prev, ...json.data.map(mapApiToProduct)]);
      setTotalPages(json.pagination?.totalPages ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-labelledby="featured-heading"
      className="px-4 pt-20 text-[#231a12] sm:px-6 lg:px-8"
      id="tyres"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className={`${raleway.className} mb-10 mt-3 place-self-center font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px]`}
          id="featured-heading"
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
          {isInitialLoad ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 justify-between">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <ProductCardSkeleton
                  className="!min-w-0 !w-full !flex-auto !snap-none"
                  key={index}
                />
              ))}
            </div>
          ) : error && products.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center text-[14px] font-medium text-[#8b7a6c]">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center text-[14px] font-medium text-[#8b7a6c]">
              No products available yet.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 justify-between">
              {products.map((product, index) => (
                <Reveal
                  className="h-full"
                  delayMs={(index % PAGE_SIZE) * 55}
                  distance="sm"
                  key={product.id}
                >
                  <ProductCard
                    className="!min-w-0 !w-full !flex-auto !snap-none"
                    product={product}
                  />
                </Reveal>
              ))}
            </div>
          )}

          {products.length > 0 && hasMore ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-[linear-gradient(180deg,rgba(249,238,228,0)_0%,rgba(249,238,228,0.64)_38%,rgba(249,238,228,0.9)_68%,#f9eee4_100%)]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex justify-center">
                <div className="h-16 w-64 rounded-full bg-[radial-gradient(circle,rgba(246,147,0,0.18)_0%,rgba(246,147,0,0.08)_42%,transparent_72%)] blur-2xl" />
              </div>

              <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center transition-transform hover:translate-y-0.5">
                <button
                  aria-label="Load more products"
                  className="w-12 disabled:opacity-50"
                  disabled={loading}
                  onClick={loadMore}
                  type="button"
                >
                  {loading ? (
                    <Loader2 aria-hidden="true" className="mx-auto h-4 w-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <ArrowBigDown aria-hidden="true" className="mx-auto h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </>
          ) : null}
        </div>

        {error && products.length > 0 ? (
          <p className="mt-4 text-center text-[12px] font-medium text-[#a85d00]">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
