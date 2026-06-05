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

const EMPTY: Product[] = [];
let snapshot: Product[] = EMPTY;
const listeners = new Set<() => void>();
let storageBound = false;

function readStorage(): Product[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]).slice(0, MAX_COMPARE) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStorage(items: Product[]) {
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

function getSnapshot(): Product[] {
  return snapshot;
}

function getServerSnapshot(): Product[] {
  return EMPTY;
}

function setSnapshot(next: Product[]) {
  snapshot = next.slice(0, MAX_COMPARE);
  writeStorage(snapshot);
  notify();
}

// ── Public hook ──────────────────────────────────────────────────────────────

export function useCompare() {
  const compare = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // `hydrated` lets callers gate UI that depends on storage state (e.g. to
  // avoid flashing "Compare" → "Comparing"). It flips once on the first client
  // commit; consumers don't need to think about SSR.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isInCompare = useCallback(
    (key: string) => snapshot.some((p) => getCompareKey(p) === key),
    // snapshot reference changes on every store update via useSyncExternalStore,
    // which causes this hook's owner to re-render — so reading the module var
    // is always fresh at call time. Listing `compare` keeps the dep linter happy.
    [compare]
  );

  const isFull = compare.length >= MAX_COMPARE;

  const toggle = useCallback((product: Product) => {
    const key = getCompareKey(product);
    const exists = snapshot.some((p) => getCompareKey(p) === key);
    if (exists) {
      setSnapshot(snapshot.filter((p) => getCompareKey(p) !== key));
      return;
    }
    if (snapshot.length >= MAX_COMPARE) return;
    setSnapshot([...snapshot, product]);
  }, []);

  const remove = useCallback((key: string) => {
    setSnapshot(snapshot.filter((p) => getCompareKey(p) !== key));
  }, []);

  const clear = useCallback(() => {
    setSnapshot([]);
  }, []);

  return { compare, hydrated, isInCompare, isFull, toggle, remove, clear };
}
