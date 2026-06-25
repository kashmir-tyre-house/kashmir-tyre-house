"use client";

import { ArrowBigDown, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Raleway } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

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

  const loadMore = async () => {
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
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setBrandId("");
  };

  return (
    <main className="min-h-screen text-[#231a12]">
      <SiteHeader />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8 max-w-330 mx-auto">
        <div className="mx-auto max-w-[1480px]">
          <div className="max-w-3xl">
            <h1
              className={`${raleway.className} mt-6 text-[38px] font-medium leading-[0.96] tracking-[-0.04em] text-[#231a12] sm:text-[52px] lg:text-[64px]`}
            >
              All Products.
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] font-medium leading-[1.8] text-[#6f6258]">
              Browse the complete range. Filter by category or brand, or search
              by name and pattern to narrow down quickly.
            </p>
          </div>

          {/* Filter card */}
          <div className="mt-10 overflow-hidden rounded-[18px] border border-[#ead9c9] bg-white shadow-[0_10px_32px_rgba(35,26,18,0.05)]">
            {/* Header strip */}
            <div className="flex items-center justify-between gap-3 border-b border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#fff1e3] text-[#a85d00]">
                  <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
                </span>
                <span className="text-[13px] font-bold tracking-[-0.01em] text-[#231a12]">
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
            <div className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[1fr_200px_240px]">
              <div className="flex flex-col gap-1.5">
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
                    className="h-11 w-full rounded-[10px] border border-[#ead9c9] bg-[#fff8f5] pl-9 pr-3 text-[13px] font-medium text-[#231a12] outline-none transition-colors duration-200 placeholder:text-[#8b7a6c] hover:border-[#d8b997] focus:border-[#a85d00] focus:ring-2 focus:ring-[#a85d00]/15"
                    id="product-search"
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Name or pattern…"
                    type="search"
                    value={searchInput}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
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

              <div className="flex flex-col gap-1.5">
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ead9c9]/60 bg-[#fffbf7] px-5 py-3">
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
          <div className="relative mt-10 pb-15">
            {loading ? (
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
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 justify-between">
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
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-[linear-gradient(180deg,rgba(249,238,228,0)_0%,rgba(249,238,228,0.64)_38%,rgba(249,238,228,0.9)_68%,#f9eee4_100%)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex justify-center">
                  <div className="h-16 w-64 rounded-full bg-[radial-gradient(circle,rgba(246,147,0,0.18)_0%,rgba(246,147,0,0.08)_42%,transparent_72%)] blur-2xl" />
                </div>

                <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center transition-transform hover:translate-y-0.5">
                  <button
                    aria-label="Load more products"
                    className="w-12 disabled:opacity-50"
                    disabled={loadingMore}
                    onClick={loadMore}
                    type="button"
                  >
                    {loadingMore ? (
                      <Loader2
                        aria-hidden="true"
                        className="mx-auto h-4 w-4 animate-spin"
                        strokeWidth={2}
                      />
                    ) : (
                      <ArrowBigDown
                        aria-hidden="true"
                        className="mx-auto h-4 w-4"
                        strokeWidth={2}
                      />
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

      <SiteFooter />
    </main>
  );
}
