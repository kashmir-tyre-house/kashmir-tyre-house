"use client";

import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Raleway } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kth/ui/select";

import { ProductCard } from "../../components/product-card";
import { ProductCardSkeleton } from "../../components/product-card-skeleton";
import { Reveal } from "../../components/reveal";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import type { Product } from "../../lib/products";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const PAGE_SIZE = 12;
const FALLBACK_IMAGE = "/images/placeholder-image.jpg";
const CATEGORIES = ["Radial", "Bais", "Solid"] as const;

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

type ApiBrand = { id: string; name: string; logoUrl: string | null };
type ApiBrandsResponse = { ok: boolean; brands: ApiBrand[]; message?: string };

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
    pattern: p.pattern ?? "—",
    starRating: p.starRating ? Number.parseFloat(p.starRating) || 0 : 0,
    image: p.primaryImageUrl ?? FALLBACK_IMAGE,
    isBookmarked: false,
  };
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#ead9c9] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#231a12] shadow-[0_2px_6px_rgba(35,26,18,0.04)]">
      {label}
      <button
        aria-label={`Remove ${label}`}
        className="-mr-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[#8b7a6c] transition-colors duration-150 hover:bg-[#fff1e3] hover:text-[#a85d00]"
        onClick={onClear}
        type="button"
      >
        <X aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={3} />
      </button>
    </span>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");

  const [brands, setBrands] = useState<ApiBrand[]>([]);

  // Debounce search input → committed search.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load brand list once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/web/brands`);
        const json = (await res.json()) as ApiBrandsResponse;
        if (cancelled) return;
        if (res.ok && json.ok) setBrands(json.brands);
      } catch {
        // Brand list is optional; ignore failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build query string for current filters + page.
  const queryFor = useMemo(
    () => (p: number) => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(p),
      });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (brandId) params.set("brandId", brandId);
      return params.toString();
    },
    [search, category, brandId]
  );

  // Reset + reload whenever filters change.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setPage(1);
      try {
        const res = await fetch(`${API_BASE}/api/web/products?${queryFor(1)}`);
        const json = (await res.json()) as ApiListResponse;
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          throw new Error(json.message ?? "Failed to load products.");
        }
        setProducts(json.data.map(mapApiToProduct));
        setTotalPages(json.pagination?.totalPages ?? 0);
        setTotal(json.pagination?.total ?? 0);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load products.");
        setProducts([]);
        setTotalPages(0);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryFor]);

  const hasMore = page < totalPages;
  const hasActiveFilters = Boolean(search || category || brandId);
  const activeFilterCount =
    (search ? 1 : 0) + (category ? 1 : 0) + (brandId ? 1 : 0);
  const selectedBrandName = brandId
    ? brands.find((b) => b.id === brandId)?.name ?? null
    : null;

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    const next = page + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/web/products?${queryFor(next)}`);
      const json = (await res.json()) as ApiListResponse;
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "Failed to load products.");
      }
      setProducts((prev) => [...prev, ...json.data.map(mapApiToProduct)]);
      setPage(next);
      setTotalPages(json.pagination?.totalPages ?? 0);
      setTotal(json.pagination?.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more products.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, hasMore, page, queryFor]);

  // Infinite scroll: load the next page when the sentinel nears the viewport.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setBrandId("");
  };

  return (
    <main className="min-h-screen text-[#231a12]">
      <SiteHeader />

      <section className="px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 max-w-330 mx-auto">
        <div className="mx-auto max-w-[1480px]">
          <div className="max-w-3xl">
            <h1
              className={`${raleway.className} text-[clamp(1.875rem,6vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[#231a12]`}
            >
              All Products.
            </h1>

            <p className="mt-3 max-w-2xl text-[13px] font-medium leading-[1.7] text-[#6f6258] sm:mt-5 sm:text-[15px] sm:leading-[1.8]">
              Browse the complete range. Filter by category or brand, or search
              by name and pattern to narrow down quickly.
            </p>
          </div>

          {/* Filter card */}
          <div className="mt-8 overflow-hidden rounded-[18px] border border-[#ead9c9] bg-white shadow-[0_10px_32px_rgba(35,26,18,0.05)] sm:mt-10">
            {/* Header strip */}
            <div className="flex items-center justify-between gap-3 border-b border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] bg-[#fff1e3] text-[#a85d00] sm:h-7 sm:w-7">
                  <SlidersHorizontal aria-hidden="true" className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
                </span>
                <span className="text-[12.5px] font-bold tracking-[-0.01em] text-[#231a12] sm:text-[13px]">
                  Filters
                </span>
                {activeFilterCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#231a12] px-1.5 text-[10px] font-bold text-[#fff8f5]">
                    {activeFilterCount}
                  </span>
                ) : null}
              </div>

              <button
                aria-label="Clear all filters"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-bold text-[#a85d00] transition-colors duration-200 hover:bg-[#fff1e3] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                disabled={!hasActiveFilters}
                onClick={clearFilters}
                type="button"
              >
                Clear all
                <X aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </div>

            {/* Field row */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[1fr_200px_240px]">
              <div className="col-span-2 flex flex-col gap-1 sm:gap-1.5 md:col-span-1">
                <label
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b7a6c]"
                  htmlFor="product-search"
                >
                  Search
                </label>
                <div className="relative flex items-center">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 h-4 w-4 text-[#8b7a6c]"
                    strokeWidth={2}
                  />
                  <input
                    className="h-10 w-full rounded-[10px] border border-[#ead9c9] bg-[#fff8f5] pl-9 pr-3 text-[12.5px] font-medium text-[#231a12] outline-none transition-colors duration-200 placeholder:text-[#8b7a6c] hover:border-[#d8b997] focus:border-[#a85d00] focus:ring-2 focus:ring-[#a85d00]/15 sm:h-11 sm:text-[13px]"
                    id="product-search"
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Name or pattern…"
                    type="search"
                    value={searchInput}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 sm:gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b7a6c]">
                  Category
                </span>
                <Select
                  onValueChange={(v) => setCategory(v === "__all" ? "" : v)}
                  value={category || "__all"}
                >
                  <SelectTrigger aria-label="Filter by category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1 sm:gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b7a6c]">
                  Brand
                </span>
                <Select
                  onValueChange={(v) => setBrandId(v === "__all" ? "" : v)}
                  value={brandId || "__all"}
                >
                  <SelectTrigger aria-label="Filter by brand">
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All brands</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Footer: chips + result count */}
            {(hasActiveFilters || (!loading && !error)) ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ead9c9]/60 bg-[#fffbf7] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {search ? (
                    <FilterChip
                      label={`Search: ${search}`}
                      onClear={() => {
                        setSearchInput("");
                        setSearch("");
                      }}
                    />
                  ) : null}
                  {category ? (
                    <FilterChip
                      label={`Category: ${category}`}
                      onClear={() => setCategory("")}
                    />
                  ) : null}
                  {brandId && selectedBrandName ? (
                    <FilterChip
                      label={`Brand: ${selectedBrandName}`}
                      onClear={() => setBrandId("")}
                    />
                  ) : null}
                </div>

                {!loading && !error ? (
                  <span className="text-[12px] font-semibold text-[#8b7a6c]">
                    {total} {total === 1 ? "product" : "products"}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Results */}
          <div className="relative mt-8 pb-15 sm:mt-10">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
              <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
                <p className="text-[15px] font-semibold text-[#231a12]">
                  No products match these filters.
                </p>
                {hasActiveFilters ? (
                  <button
                    className="text-[13px] font-bold text-[#a85d00] underline-offset-4 hover:underline"
                    onClick={clearFilters}
                    type="button"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                  <Reveal
                    className="h-full"
                    delayMs={(index % PAGE_SIZE) * 40}
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
                {/* Sentinel: triggers the next page as it nears the viewport. */}
                <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

                {loadingMore ? (
                  <div className="flex justify-center py-8">
                    <Loader2
                      aria-label="Loading more products"
                      className="h-5 w-5 animate-spin text-[#a85d00]"
                      strokeWidth={2}
                    />
                  </div>
                ) : null}
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

      <SiteFooter />
    </main>
  );
}
