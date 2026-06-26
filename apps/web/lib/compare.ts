"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import type { Product } from "./products";

const STORAGE_KEY = "kth_compare_v1";
export const MAX_COMPARE = 3;

export function getCompareKey(product: Pick<Product, "id" | "productName">) {
  return product.id ?? product.productName;
}

// ── Shared module-level store ────────────────────────────────────────────────
// One snapshot, many subscribers. `useSyncExternalStore` keeps every component
// in sync — so a toggle anywhere triggers a re-render of every ProductCard and
// the SiteHeader badge simultaneously.
//
// We persist ONLY product ids (not full objects). Pages hydrate the details
// from the API (`/api/web/products/batch`) on demand.

const EMPTY: string[] = [];
let snapshot: string[] = EMPTY;
const listeners = new Set<() => void>();
let storageBound = false;

// Accepts the current (id[]) format and the legacy (Product[]) format, returning
// a clean id list so existing users' saved data keeps working.
function normalizeIds(parsed: unknown): string[] {
  if (!Array.isArray(parsed)) return EMPTY;
  const ids = parsed
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const obj = item as Partial<Product>;
        return obj.id ?? obj.productName ?? null;
      }
      return null;
    })
    .filter((x): x is string => typeof x === "string" && x.length > 0);
  return ids.slice(0, MAX_COMPARE);
}

function readStorage(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return normalizeIds(JSON.parse(raw));
  } catch {
    return EMPTY;
  }
}

function writeStorage(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or storage disabled — ignore
  }
}

function notify() {
  for (const cb of listeners) cb();
}

function onStorageEvent(e: StorageEvent) {
  // Fires for changes made in OTHER tabs — re-read and notify here.
  if (e.key === STORAGE_KEY) {
    snapshot = readStorage();
    notify();
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!storageBound && typeof window !== "undefined") {
    // First subscriber: hydrate snapshot from storage and start listening for
    // cross-tab updates. The hydration triggers another notify so subscribers
    // re-render with the real data.
    snapshot = readStorage();
    window.addEventListener("storage", onStorageEvent);
    storageBound = true;
    // Notify in a microtask so React isn't surprised by a synchronous change
    // during the subscribe call itself.
    queueMicrotask(notify);
  }
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): string[] {
  return snapshot;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function setSnapshot(next: string[]) {
  snapshot = next.slice(0, MAX_COMPARE);
  writeStorage(snapshot);
  notify();
}

// ── Public hook ──────────────────────────────────────────────────────────────

export function useCompare() {
  // `compare` is the list of saved product ids.
  const compare = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // `hydrated` lets callers gate UI that depends on storage state (e.g. to
  // avoid flashing "Compare" → "Comparing"). It flips once on the first client
  // commit; consumers don't need to think about SSR.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isInCompare = useCallback(
    (key: string) => snapshot.includes(key),
    // snapshot reference changes on every store update via useSyncExternalStore,
    // which causes this hook's owner to re-render — so reading the module var
    // is always fresh at call time. Listing `compare` keeps the dep linter happy.
    [compare]
  );

  const isFull = compare.length >= MAX_COMPARE;

  const toggle = useCallback((product: Product) => {
    const key = getCompareKey(product);
    if (snapshot.includes(key)) {
      setSnapshot(snapshot.filter((id) => id !== key));
      return;
    }
    if (snapshot.length >= MAX_COMPARE) return;
    setSnapshot([...snapshot, key]);
  }, []);

  const remove = useCallback((key: string) => {
    setSnapshot(snapshot.filter((id) => id !== key));
  }, []);

  const removeMany = useCallback((keys: string[]) => {
    if (keys.length === 0) return;
    const drop = new Set(keys);
    setSnapshot(snapshot.filter((id) => !drop.has(id)));
  }, []);

  const clear = useCallback(() => {
    setSnapshot([]);
  }, []);

  return { compare, hydrated, isInCompare, isFull, toggle, remove, removeMany, clear };
}
