"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Raleway } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCard } from "../../components/product-card";
import { ProductCardSkeleton } from "../../components/product-card-skeleton";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { useBookmarks } from "../../lib/bookmarks";
import { addManyToEnquiry } from "../../lib/enquiry";
import type { Product } from "../../lib/products";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const FALLBACK_IMAGE = "/images/placeholder-image.jpg";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  images: Array<{ id: string; url: string; isPrimaryImage: boolean }>;
};

type BatchResponse =
  | { ok: true; data: ApiProduct[] }
  | { ok: false; message: string };

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
    pattern: p.pattern ?? "—",
    starRating: p.starRating ? Number.parseFloat(p.starRating) || 0 : 0,
    image: primary?.url ?? FALLBACK_IMAGE,
    isBookmarked: true,
  };
}

function EmptyView() {
  return (
    <div className="mt-20 h-[90vh] flex flex-col items-center justify-center text-center">
      <Image
        alt="No bookmarks"
        className="opacity-80"
        height={140}
        src="/illustrations/empty-box.svg"
        width={300}
      />
      <h2
        className={`${raleway.className} mt-8 text-[26px] font-medium tracking-[-0.03em] text-[#231a12]`}
      >
        No saved products yet
      </h2>
      <p className="mt-3 max-w-sm text-[14px] leading-[1.8] text-[#6f6258]">
        Products you bookmark will appear here so you can compare them and raise
        an enquiry when you&apos;re ready.
      </p>
      <Link
        className="mt-8 inline-flex items-center gap-2 rounded-[10px] bg-[#231a12] px-6 py-3 text-[13px] font-semibold text-white transition hover:bg-[#3a2f25]"
        href="/#tyres"
      >
        Browse products
        <svg
          fill="none"
          height="13"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="13"
        >
          <line x1="5" x2="19" y1="12" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}

export default function BookmarksPage() {
  const router = useRouter();
  const { bookmarks, hydrated, removeMany } = useBookmarks();

  // Maps id → product. Ids the API doesn't return (deleted/inactive) are pruned
  // from storage instead of being kept around.
  const [cache, setCache] = useState<Record<string, ApiProduct>>({});
  const [error, setError] = useState<string | null>(null);
  const inFlightIds = useRef<Set<string>>(new Set());

  const bookmarkIds = useMemo(
    () => bookmarks.filter((id) => UUID_RE.test(id)),
    [bookmarks]
  );

  // Fetch any not-yet-cached bookmark details from the batch API.
  useEffect(() => {
    if (!hydrated) return;
    const missing = bookmarkIds.filter(
      (id) => cache[id] === undefined && !inFlightIds.current.has(id)
    );
    if (missing.length === 0) return;

    let cancelled = false;
    for (const id of missing) inFlightIds.current.add(id);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/web/products/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: missing }),
        });
        const json = (await res.json()) as BatchResponse;
        if (!res.ok || !json.ok) {
          throw new Error(("message" in json && json.message) || "Failed to load.");
        }
        if (cancelled) return;
        const found = new Map(json.data.map((p) => [p.id, p]));
        setCache((prev) => {
          const next = { ...prev };
          for (const [id, product] of found) next[id] = product;
          return next;
        });
        // Ids the API didn't return are deleted/inactive — drop them from
        // localStorage so they stop showing up entirely.
        const notFound = missing.filter((id) => !found.has(id));
        if (notFound.length > 0) removeMany(notFound);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load bookmarks.");
      } finally {
        for (const id of missing) inFlightIds.current.delete(id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, bookmarkIds, cache, removeMany]);

  // Loaded products, in saved order.
  const loadedProducts: ApiProduct[] = useMemo(
    () =>
      bookmarkIds
        .map((id) => cache[id])
        .filter((p): p is ApiProduct => Boolean(p)),
    [bookmarkIds, cache]
  );

  const isLoading = useMemo(
    () => bookmarkIds.some((id) => cache[id] === undefined),
    [bookmarkIds, cache]
  );

  const showEmpty = hydrated && bookmarkIds.length === 0;

  function handleEnquireAll() {
    addManyToEnquiry(loadedProducts.map(toProduct));
    router.push("/contact");
  }

  return (
    <main className="min-h-screen text-[#231a12] bg-[#f9eee4]">
      <SiteHeader />

      {showEmpty ? (
        <EmptyView />
      ) : hydrated ? (
        <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8 max-w-330 mx-auto">
          <div className="mx-auto max-w-[1480px]">
            <div className="max-w-3xl">
              <h1
                className={`${raleway.className} mt-6 text-[38px] font-medium leading-[0.96] tracking-[-0.04em] text-[#231a12] sm:text-[52px] lg:text-[64px]`}
              >
                Bookmarked products.
              </h1>

              <p className="mt-5 max-w-2xl text-[15px] font-medium leading-[1.8] text-[#6f6258]">
                A focused shortlist of tyres worth revisiting. Use this page to
                compare the products you have saved and move quickly into an
                enquiry when you are ready.
              </p>

              <button
                className="group mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loadedProducts.length === 0}
                onClick={handleEnquireAll}
                type="button"
              >
                Enquire all ({loadedProducts.length})
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </button>
            </div>

            {error && loadedProducts.length === 0 && !isLoading ? (
              <p className="mt-10 text-[14px] font-medium text-[#a85d00]">
                {error}
              </p>
            ) : null}

            <div className="mt-14 flex flex-wrap items-start gap-5">
              {loadedProducts.map((product) => (
                <ProductCard
                  className="!min-w-[290px] !max-w-[290px] !w-full !flex-[1_1_290px] !snap-none"
                  key={product.id}
                  product={toProduct(product)}
                />
              ))}

              {isLoading
                ? Array.from({
                    length: Math.max(bookmarkIds.length - loadedProducts.length, 1),
                  }).map((_, i) => (
                    <ProductCardSkeleton
                      className="!min-w-[290px] !max-w-[290px] !w-full !flex-[1_1_290px] !snap-none"
                      key={`sk-${i}`}
                    />
                  ))
                : null}
            </div>
          </div>
        </section>
      ) : (
        <div className="min-h-[60vh]" />
      )}

      <SiteFooter />
    </main>
  );
}
