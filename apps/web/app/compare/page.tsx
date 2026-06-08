"use client";

import { ArrowRight, Loader2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Karla, Raleway } from "next/font/google";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getCompareKey, MAX_COMPARE, useCompare } from "../../lib/compare";
import { addToEnquiry } from "../../lib/enquiry";
import type { Product } from "../../lib/products";

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
  brand: { id: string; name: string; logoUrl: string | null } | null;
  images: Array<{ id: string; url: string; isPrimaryImage: boolean }>;
};

type ApiResponse =
  | { ok: true; data: ApiProduct }
  | { ok: false; message: string };

type Slot =
  | { kind: "loaded"; product: ApiProduct }
  | { kind: "loading"; id: string }
  | { kind: "empty" };

type SpecField = {
  label: string;
  // `pick` returns a normalized string for diff detection (and as the default cell content).
  pick: (p: ApiProduct) => string | null;
  // `render` optionally overrides the cell content with custom JSX (e.g. stars).
  render?: (p: ApiProduct) => React.ReactNode;
};

const SPEC_SECTIONS: Array<{ title: string; fields: SpecField[] }> = [
  {
    title: "General",
    fields: [
      { label: "Tyre Size",    pick: (p) => p.tyreSize },
      { label: "Category",     pick: (p) => p.category },
      { label: "Vehicle Type", pick: (p) => p.vehicleType },
      { label: "Pattern",      pick: (p) => p.pattern },
      { label: "Rim",          pick: (p) => p.rim },
      { label: "Tread Depth",  pick: (p) => p.treadDepth },
    ],
  },
  {
    title: "Performance & Build",
    fields: [
      { label: "Load Index",  pick: (p) => p.loadIndex },
      { label: "Ply Rating",  pick: (p) => p.plyRating },
      {
        label: "Star Rating",
        pick: (p) => p.starRating,
        render: (p) => {
          const r = p.starRating ? Number.parseFloat(p.starRating) || 0 : 0;
          return <StarRow rating={r} />;
        },
      },
      { label: "Tyre Type",   pick: (p) => p.tyreType },
      { label: "Application", pick: (p) => p.application },
      { label: "Tyre Weight", pick: (p) => (p.tyreWeight ? `${p.tyreWeight} kg` : null) },
    ],
  },
];

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

// True when 2+ products provide a value and those values aren't identical.
function isDifferentiator(values: Array<string | null>): boolean {
  const defined = values
    .filter((v): v is string => Boolean(v && v.trim() !== ""))
    .map((v) => v.trim().toLowerCase());
  if (defined.length < 2) return false;
  return new Set(defined).size > 1;
}

function StarRow({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-[#f69300]">
        {Array.from({ length: filled }).map((_, i) => (
          <svg
            aria-hidden="true"
            className={`h-3 w-3 ${i < filled ? "fill-current" : "fill-transparent"}`}
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

function EmptyState() {
  return (
    <div className="mt-12 flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative h-[140px] w-[280px] opacity-90">
        <Image
          alt="Empty compare"
          className="object-contain"
          fill
          sizes="280px"
          src="/illustrations/empty-box.svg"
        />
      </div>
      <h2
        className={`${raleway.className} mt-8 text-[26px] font-medium tracking-[-0.03em] text-[#231a12]`}
      >
        Nothing to compare yet
      </h2>
      <p className="mt-3 max-w-md text-[14px] leading-[1.8] text-[#6f6258]">
        Add up to {MAX_COMPARE} tyres from the product list to see their specs
        side-by-side and pick the right fit.
      </p>
      <Link
        className="mt-8 inline-flex items-center gap-2 rounded-[10px] bg-[#231a12] px-6 py-3 text-[13px] font-semibold text-white transition hover:bg-[#3a2f25]"
        href="/products"
      >
        Browse products
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

// Compact, refined product header cell — sits inside <th> in <thead>.
function ProductHeaderCell({
  product,
  onRemove,
}: {
  product: ApiProduct;
  onRemove: () => void;
}) {
  const primary = product.images.find((img) => img.isPrimaryImage) ?? product.images[0];

  return (
    <div className="relative flex h-full flex-col items-start gap-3 px-1">
      <button
        aria-label={`Remove ${product.name} from compare`}
        className="absolute right-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ead9c9] bg-white text-[#8b7a6c] transition-all duration-200 hover:border-[#a85d00] hover:bg-[#fff1e3] hover:text-[#a85d00]"
        onClick={onRemove}
        type="button"
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <Link
        aria-label={`View ${product.name} details`}
        className="relative aspect-square w-full max-w-[180px] overflow-hidden rounded-[14px] border border-[#ead9c9]/70 bg-[radial-gradient(circle_at_50%_45%,rgba(246,147,0,0.10),transparent_42%),linear-gradient(180deg,#fff7ef_0%,#f0e0cf_100%)] transition-all duration-200 hover:border-[#a85d00] hover:shadow-[0_8px_22px_rgba(168,93,0,0.12)] focus-visible:border-[#a85d00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a85d00]/30"
        href={`/products/${product.id}`}
      >
        <Image
          alt={`${product.brand?.name ?? ""} ${product.name}`}
          className="object-contain p-3 rounded-[20px]"
          fill
          sizes="180px"
          src={primary?.url ?? FALLBACK_IMAGE}
          unoptimized
        />
      </Link>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c07000]">
          {product.brand?.name ?? "—"}
        </p>
        <Link
          aria-label={`View ${product.name} details`}
          className={`${raleway.className} mt-1 line-clamp-2 block text-[14px] font-bold uppercase leading-[1.15] tracking-[-0.01em] text-[#231a12] transition-colors duration-200 hover:text-[#a85d00] focus-visible:text-[#a85d00] focus-visible:outline-none`}
          href={`/products/${product.id}`}
        >
          {product.name}
        </Link>
      </div>
    </div>
  );
}

// Compact empty slot — fits inside <th> in <thead>.
function EmptyHeaderCell() {
  return (
    <Link
      className="group flex h-full min-h-[230px] flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#ead9c9] bg-[#fffbf7] p-4 text-center transition-all duration-200 hover:border-[#a85d00] hover:bg-[#fff1e3]"
      href="/products"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead9c9] bg-white text-[#a85d00] transition-transform duration-200 group-hover:scale-110">
        <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <p className="mt-3 text-[13px] font-bold text-[#231a12]">Add a tyre</p>
      <p className="mt-1 text-[11px] font-medium text-[#8b7a6c]">
        Browse products
      </p>
    </Link>
  );
}

// Compact loading slot for the thead.
function LoadingHeaderCell() {
  return (
    <div className="flex h-full min-h-[230px] flex-col items-start gap-3 px-1">
      <div className="aspect-square w-full max-w-[180px] animate-pulse rounded-[14px] bg-[linear-gradient(110deg,#ead9c9_0%,#f3e4d4_45%,#ead9c9_100%)]" />
      <div className="w-full space-y-2">
        <div className="h-2.5 w-16 animate-pulse rounded bg-[#ead9c9]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#ead9c9]" />
      </div>
    </div>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const { compare, hydrated, remove, clear } = useCompare();

  const [cache, setCache] = useState<Record<string, ApiProduct>>({});
  const [error, setError] = useState<string | null>(null);
  const inFlightIds = useRef<Set<string>>(new Set());

  const compareIds = useMemo(
    () => compare.map((p) => p.id).filter((id): id is string => Boolean(id)),
    [compare]
  );

  useEffect(() => {
    if (!hydrated) return;
    const missing = compareIds.filter(
      (id) => !cache[id] && !inFlightIds.current.has(id)
    );
    if (missing.length === 0) return;

    let cancelled = false;
    for (const id of missing) inFlightIds.current.add(id);

    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            const res = await fetch(`${API_BASE}/api/web/products/${id}`);
            const json = (await res.json()) as ApiResponse;
            if (!res.ok || !json.ok) {
              throw new Error(("message" in json && json.message) || "Failed to load.");
            }
            return [id, json.data] as const;
          })
        );
        if (cancelled) return;
        setCache((prev) => {
          const next = { ...prev };
          for (const [id, data] of results) next[id] = data;
          return next;
        });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load compare products.");
      } finally {
        for (const id of missing) inFlightIds.current.delete(id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, compareIds, cache]);

  const slots: Slot[] = useMemo(() => {
    const result: Slot[] = compare.map<Slot>((p) => {
      if (!p.id) return { kind: "empty" };
      const loaded = cache[p.id];
      if (loaded) return { kind: "loaded", product: loaded };
      return { kind: "loading", id: p.id };
    });
    while (result.length < MAX_COMPARE) result.push({ kind: "empty" });
    return result.slice(0, MAX_COMPARE);
  }, [compare, cache]);

  const loadedProducts: ApiProduct[] = slots
    .map((s) => (s.kind === "loaded" ? s.product : null))
    .filter((p): p is ApiProduct => p !== null);

  const hasAnyDescription = loadedProducts.some((p) => p.description);
  const hasAnyFeatures = loadedProducts.some(
    (p) => p.tyreFeatures && p.tyreFeatures.length > 0
  );

  const handleEnquire = (p: ApiProduct) => {
    addToEnquiry(toProduct(p));
    router.push("/contact");
  };

  // Renders the value cell for one (slot × spec) pair. Pass `loadedNode` to
  // override the default string display with custom JSX (e.g. star icons).
  const renderValueCell = (
    slot: Slot,
    value: string | null,
    key: string,
    loadedNode?: React.ReactNode
  ) => {
    if (slot.kind === "loaded") {
      if (loadedNode !== undefined) {
        return (
          <td
            className="border-b border-[#ead9c9]/50 px-5 py-4 align-top text-[13px] font-semibold text-[#231a12]"
            key={key}
          >
            {loadedNode}
          </td>
        );
      }
      const display = value && value.trim() !== "" ? value : null;
      return (
        <td
          className="border-b border-[#ead9c9]/50 px-5 py-4 align-top text-[13px] font-semibold text-[#231a12]"
          key={key}
        >
          {display ?? <span className="text-[#c0ac9e]">—</span>}
        </td>
      );
    }
    return (
      <td
        className="border-b border-[#ead9c9]/50 px-5 py-4 align-top text-[12px] font-medium text-[#c0ac9e]"
        key={key}
      >
        {slot.kind === "loading" ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2
              aria-hidden="true"
              className="h-3 w-3 animate-spin"
              strokeWidth={2}
            />
            Loading…
          </span>
        ) : (
          "—"
        )}
      </td>
    );
  };

  if (!hydrated) {
    return (
      <main className={`${karla.className} min-h-screen bg-[#f9eee4] text-[#231a12]`}>
        <SiteHeader />
        <div className="min-h-[60vh]" />
        <SiteFooter />
      </main>
    );
  }

  if (compare.length === 0) {
    return (
      <main className={`${karla.className} min-h-screen bg-[#f9eee4] text-[#231a12]`}>
        <SiteHeader />
        <section className="mx-auto max-w-[1480px] px-4 pb-20 pt-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className={`${raleway.className} text-[38px] font-medium leading-[0.96] tracking-[-0.04em] text-[#231a12] sm:text-[52px] lg:text-[64px]`}
            >
              Compare tyres.
            </h1>
          </div>
          <EmptyState />
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className={`${karla.className} min-h-screen bg-[#f9eee4] text-[#231a12]`}>
      <SiteHeader />

      <section className="mx-auto max-w-[1480px] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        {/* ─── Page header ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ead9c9] bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a85d00] backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f69300]" />
              Side-by-side
            </span>
            <h1
              className={`${raleway.className} mt-4 text-[38px] font-medium leading-[0.96] tracking-[-0.04em] text-[#231a12] sm:text-[52px] lg:text-[64px]`}
            >
              Compare tyres.
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] font-medium leading-[1.8] text-[#6f6258]">
              Up to {MAX_COMPARE} products side-by-side. Differences are
              highlighted so you can spot what sets each tyre apart.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ead9c9] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#231a12] shadow-[0_4px_12px_rgba(35,26,18,0.04)]">
              <span className="text-[#a85d00]">{compare.length}</span>
              <span className="text-[#c0ac9e]">/</span>
              <span>{MAX_COMPARE} selected</span>
            </span>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#231a12]/15 bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#231a12] shadow-[0_4px_12px_rgba(35,26,18,0.04)] transition-colors duration-200 hover:border-[#a85d00] hover:bg-[#fff1e3] hover:text-[#a85d00]"
              onClick={clear}
              type="button"
            >
              <Trash2 aria-hidden="true" className="h-3 w-3" strokeWidth={2.25} />
              Clear all
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-[10px] border border-[#f3c0c0] bg-[#fff5f5] px-4 py-3 text-[13px] font-medium text-[#a83232]">
            {error}
          </p>
        ) : null}

        {/* ─── Comparison table card ──────────────────────────────── */}
        <div className="mt-10 overflow-hidden rounded-[20px] border border-[#d8b997] bg-white shadow-[0_2px_0_rgba(255,255,255,0.6)_inset,0_24px_64px_-12px_rgba(35,26,18,0.18),0_8px_24px_-8px_rgba(35,26,18,0.10)] ring-1 ring-[#ead9c9]/30">
          {/* Top accent stripe — gives the card a clear visual identity */}
          <div
            aria-hidden="true"
            className="h-1 w-full bg-[linear-gradient(90deg,#f69300_0%,#d47d00_42%,#6f3f00_100%)]"
          />

          {/* Differences-highlighted legend */}
          {loadedProducts.length > 1 ? (
            <div className="flex items-center justify-between gap-3 border-b border-[#ead9c9]/60 bg-[linear-gradient(180deg,#fff1e3_0%,#fffbf7_100%)] px-5 py-3 text-[11px] font-semibold text-[#8b7a6c]">
              <span>Comparing {loadedProducts.length} tyres</span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#fff1e3] ring-1 ring-[#f8ab59]/40" />
                Differs across products
              </span>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left">
              {/* ─── Product header row ──────────────────────────── */}
              <thead>
                <tr>
                  <th
                    aria-hidden="true"
                    className="sticky left-0 z-10 w-[180px] border-b border-[#ead9c9]/70 bg-white p-5 align-top"
                  />
                  {slots.map((slot, i) => (
                    <th
                      className="border-b border-l border-[#ead9c9]/50 bg-white p-5 align-top"
                      key={`thead-${i}`}
                      scope="col"
                    >
                      {slot.kind === "loaded" ? (
                        <ProductHeaderCell
                          onRemove={() =>
                            remove(
                              getCompareKey({
                                id: slot.product.id,
                                productName: slot.product.name,
                              })
                            )
                          }
                          product={slot.product}
                        />
                      ) : slot.kind === "loading" ? (
                        <LoadingHeaderCell />
                      ) : (
                        <EmptyHeaderCell />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ─── Spec sections ─────────────────────────────── */}
                {SPEC_SECTIONS.map((section) => (
                  <Fragment key={section.title}>
                    {/* Section header row */}
                    <tr>
                      <th
                        className="sticky left-0 z-10 border-b border-t border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fdebd9_0%,#fff1e3_100%)] px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-[#a85d00]"
                        colSpan={1 + MAX_COMPARE}
                        scope="colgroup"
                      >
                        {section.title}
                      </th>
                    </tr>

                    {/* Spec rows */}
                    {section.fields.map((field, idx) => {
                      const values: Array<string | null> = slots.map((s) =>
                        s.kind === "loaded" ? field.pick(s.product) : null
                      );
                      const differs = isDifferentiator(values);
                      const zebra = idx % 2 === 1;
                      const rowBg = differs
                        ? "bg-[#fff1e3]/55"
                        : zebra
                          ? "bg-[#fffbf7]"
                          : "bg-white";

                      return (
                        <tr className={`group ${rowBg}`} key={field.label}>
                          <th
                            className={`sticky left-0 z-10 border-b border-[#ead9c9]/50 px-5 py-4 align-top text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a5100]/80 ${rowBg}`}
                            scope="row"
                          >
                            {field.label}
                          </th>
                          {slots.map((slot, slotIdx) => {
                            const loadedNode =
                              field.render && slot.kind === "loaded"
                                ? field.render(slot.product)
                                : undefined;
                            return renderValueCell(
                              slot,
                              values[slotIdx],
                              `${field.label}-${slotIdx}`,
                              loadedNode
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}

                {/* ─── Description section ───────────────────────── */}
                {hasAnyDescription ? (
                  <>
                    <tr>
                      <th
                        className="sticky left-0 z-10 border-b border-t border-[#ead9c9]/70 bg-[linear-gradient(180deg,#fdebd9_0%,#fff1e3_100%)] px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-[#a85d00]"
                        colSpan={1 + MAX_COMPARE}
                        scope="colgroup"
                      >
                        About
                      </th>
                    </tr>
                    <tr className="bg-white">
                      <th
                        className="sticky left-0 z-10 border-b border-[#ead9c9]/50 bg-white px-5 py-4 align-top text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a5100]/80"
                        scope="row"
                      >
                        Description
                      </th>
                      {slots.map((slot, i) => {
                        if (slot.kind === "loaded") {
                          return (
                            <td
                              className="border-b border-[#ead9c9]/50 px-5 py-4 align-top text-[13px] leading-[1.75] text-[#6f6258]"
                              key={`desc-${i}`}
                            >
                              {slot.product.description ?? (
                                <span className="text-[#c0ac9e]">—</span>
                              )}
                            </td>
                          );
                        }
                        return (
                          <td
                            className="border-b border-[#ead9c9]/50 px-5 py-4 align-top text-[12px] font-medium text-[#c0ac9e]"
                            key={`desc-${i}`}
                          >
                            —
                          </td>
                        );
                      })}
                    </tr>
                  </>
                ) : null}

                {/* ─── Features section ──────────────────────────── */}
                {hasAnyFeatures ? (
                  <tr className="bg-white">
                    <th
                      className="sticky left-0 z-10 border-b border-[#ead9c9]/50 bg-white px-5 py-4 align-top text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a5100]/80"
                      scope="row"
                    >
                      Key Features
                    </th>
                    {slots.map((slot, i) => {
                      if (slot.kind === "loaded") {
                        const features = slot.product.tyreFeatures ?? [];
                        return (
                          <td
                            className="border-b border-[#ead9c9]/50 px-5 py-4 align-top"
                            key={`feat-${i}`}
                          >
                            {features.length === 0 ? (
                              <span className="text-[12px] text-[#c0ac9e]">—</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {features.map((f) => (
                                  <span
                                    className="inline-flex items-center rounded-full border border-[#ead9c9] bg-[#fff8f5] px-2.5 py-1 text-[11px] font-semibold text-[#544434]"
                                    key={f}
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td
                          className="border-b border-[#ead9c9]/50 px-5 py-4 align-top text-[12px] font-medium text-[#c0ac9e]"
                          key={`feat-${i}`}
                        >
                          —
                        </td>
                      );
                    })}
                  </tr>
                ) : null}

                {/* ─── Action row ────────────────────────────────── */}
                {loadedProducts.length > 0 ? (
                  <tr className="bg-[linear-gradient(180deg,#fffbf7_0%,#fdebd9_100%)]">
                    <th
                      aria-hidden="true"
                      className="sticky left-0 z-10 bg-[#fdebd9] px-5 py-5"
                    />
                    {slots.map((slot, i) => {
                      if (slot.kind === "loaded") {
                        return (
                          <td className="px-5 py-5 align-middle" key={`cta-${i}`}>
                            <button
                              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)]"
                              onClick={() => handleEnquire(slot.product)}
                              type="button"
                            >
                              Add to Enquiry
                              <ArrowRight
                                aria-hidden="true"
                                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                                strokeWidth={2.5}
                              />
                            </button>
                          </td>
                        );
                      }
                      return <td className="px-5 py-5" key={`cta-${i}`} />;
                    })}
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div
            aria-hidden="true"
            className="h-1 w-full bg-[linear-gradient(90deg,#f69300_0%,#d47d00_42%,#6f3f00_100%)]"
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
