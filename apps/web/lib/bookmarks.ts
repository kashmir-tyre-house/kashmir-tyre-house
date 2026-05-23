"use client";

import { useCallback, useEffect, useState } from "react";

import type { Product } from "./products";

const STORAGE_KEY = "kth_bookmarks_v1";

export function getBookmarkKey(product: Pick<Product, "id" | "productName">) {
  return product.id ?? product.productName;
}

function readStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or storage disabled — ignore
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBookmarks(readStorage());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setBookmarks(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isBookmarked = useCallback(
    (key: string) => bookmarks.some((b) => getBookmarkKey(b) === key),
    [bookmarks]
  );

  const toggle = useCallback((product: Product) => {
    setBookmarks((prev) => {
      const key = getBookmarkKey(product);
      const exists = prev.some((b) => getBookmarkKey(b) === key);
      const next = exists
        ? prev.filter((b) => getBookmarkKey(b) !== key)
        : [...prev, { ...product, isBookmarked: true }];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => getBookmarkKey(b) !== key);
      writeStorage(next);
      return next;
    });
  }, []);

  return { bookmarks, hydrated, isBookmarked, toggle, remove };
}
