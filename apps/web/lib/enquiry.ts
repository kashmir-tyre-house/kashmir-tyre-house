"use client";

import { useCallback, useEffect, useState } from "react";

import { getBookmarkKey } from "./bookmarks";
import type { Product } from "./products";

const STORAGE_KEY = "kth_enquiry_products_v1";

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
}

// Plain helper for use outside React (e.g. a click handler before navigation).
// Replaces any existing enquiry product — only the most recently selected
// product is shown on the contact page's Selected Products list.
export function addToEnquiry(product: Product) {
  const next = [product];
  writeStorage(next);
  return next;
}

export function useEnquiryProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => {
      const next = prev.filter((p) => getBookmarkKey(p) !== key);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    writeStorage([]);
  }, []);

  return { items, hydrated, remove, clear };
}
