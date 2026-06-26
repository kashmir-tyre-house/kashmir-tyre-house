"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import type { Product } from "./products";

const STORAGE_KEY = "kth_bookmarks_v1";

export function getBookmarkKey(product: Pick<Product, "id" | "productName">) {
  return product.id ?? product.productName;
}

// ── Shared module-level store ────────────────────────────────────────────────
// See lib/compare.ts for the rationale — one snapshot, many subscribers, kept
// in sync via useSyncExternalStore so toggles propagate everywhere instantly.
//
// We persist ONLY product ids (not full objects). The bookmarks page hydrates
// the details from the API (`/api/web/products/batch`) on demand.

const EMPTY: string[] = [];
let snapshot: string[] = EMPTY;
const listeners = new Set<() => void>();
let storageBound = false;

// Accepts the current (id[]) format and the legacy (Product[]) format, returning
// a clean id list so existing users' saved data keeps working.
function normalizeIds(parsed: unknown): string[] {
  if (!Array.isArray(parsed)) return EMPTY;
  return parsed
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const obj = item as Partial<Product>;
        return obj.id ?? obj.productName ?? null;
      }
      return null;
    })
    .filter((x): x is string => typeof x === "string" && x.length > 0);
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
  if (e.key === STORAGE_KEY) {
    snapshot = readStorage();
    notify();
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!storageBound && typeof window !== "undefined") {
    snapshot = readStorage();
    window.addEventListener("storage", onStorageEvent);
    storageBound = true;
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
  snapshot = next;
  writeStorage(snapshot);
  notify();
}

// ── Public hook ──────────────────────────────────────────────────────────────

export function useBookmarks() {
  // `bookmarks` is the list of saved product ids.
  const bookmarks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isBookmarked = useCallback(
    (key: string) => snapshot.includes(key),
    [bookmarks]
  );

  const toggle = useCallback((product: Product) => {
    const key = getBookmarkKey(product);
    if (snapshot.includes(key)) {
      setSnapshot(snapshot.filter((id) => id !== key));
      return;
    }
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

  return { bookmarks, hydrated, isBookmarked, toggle, remove, removeMany };
}
