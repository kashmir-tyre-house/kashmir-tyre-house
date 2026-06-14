"use client";

import { useCallback, useEffect, useState } from "react";

import { getBookmarkKey } from "./bookmarks";
import type { Product } from "./products";

const STORAGE_KEY = "kth_enquiry_products_v1";

// Module-level subscribers so every useEnquiryProducts() instance — plus any
// imperative add/remove — stays in sync within the tab without a full reload.
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: Product[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or storage disabled — ignore
  }
  emit();
}

// Merge `incoming` into `existing`, de-duplicating by bookmark key and
// preserving order (existing first, then any new products).
function mergeUnique(existing: Product[], incoming: Product[]): Product[] {
  const seen = new Set(existing.map(getBookmarkKey));
  const merged = [...existing];

  for (const product of incoming) {
    const key = getBookmarkKey(product);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(product);
    }
  }

  return merged;
}

// Plain helper for use outside React (e.g. a click handler before navigation).
// Appends the product to the existing enquiry list (de-duplicated) so multiple
// products can be enquired about together.
export function addToEnquiry(product: Product) {
  const next = mergeUnique(readStorage(), [product]);
  writeStorage(next);
  return next;
}

// Bulk variant — adds several products at once (e.g. "enquire all" actions).
export function addManyToEnquiry(products: Product[]) {
  const next = mergeUnique(readStorage(), products);
  writeStorage(next);
  return next;
}

// Remove a product from the enquiry list by its bookmark key.
export function removeFromEnquiry(key: string) {
  const next = readStorage().filter((p) => getBookmarkKey(p) !== key);
  writeStorage(next);
  return next;
}

// Add the product if absent, remove it if already present.
export function toggleEnquiry(product: Product) {
  const key = getBookmarkKey(product);
  const current = readStorage();
  const exists = current.some((p) => getBookmarkKey(p) === key);
  const next = exists
    ? current.filter((p) => getBookmarkKey(p) !== key)
    : [...current, product];
  writeStorage(next);
  return next;
}

export function clearEnquiry() {
  writeStorage([]);
}

// Whether a product is already part of the current enquiry list.
export function isInEnquiry(product: Product): boolean {
  const key = getBookmarkKey(product);
  return readStorage().some((p) => getBookmarkKey(p) === key);
}

export function useEnquiryProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readStorage());
    sync();
    setHydrated(true);

    // Re-sync on imperative changes (same tab) and storage events (other tabs).
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((product: Product) => addToEnquiry(product), []);
  const remove = useCallback((key: string) => removeFromEnquiry(key), []);
  const toggle = useCallback((product: Product) => toggleEnquiry(product), []);
  const clear = useCallback(() => clearEnquiry(), []);
  const has = useCallback(
    (product: Product) => {
      const key = getBookmarkKey(product);
      return items.some((p) => getBookmarkKey(p) === key);
    },
    [items]
  );

  return { items, hydrated, add, remove, toggle, clear, has };
}
