"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// ── Toast store ───────────────────────────────────────────────────────────────
// Module-level so any component can call `toast(...)` without a provider; the
// single <Toaster /> mounted in the layout subscribes and renders the stack.

export type ToastVariant = "default" | "success" | "error" | "warning";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  dismissible: boolean;
};

let toasts: Toast[] = [];
const EMPTY: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return toasts;
}

function getServerSnapshot() {
  return EMPTY;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  notify();
}

export function toast(
  message: string,
  options?: { variant?: ToastVariant; duration?: number; dismissible?: boolean }
) {
  const id = Math.random().toString(36).slice(2);
  const duration = options?.duration ?? 4500;
  toasts = [
    ...toasts,
    {
      id,
      message,
      variant: options?.variant ?? "default",
      dismissible: options?.dismissible ?? true,
    },
  ];
  notify();

  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismissToast(id), duration)
    );
  }

  return id;
}

// ── Presentation ──────────────────────────────────────────────────────────────
// Single-line rounded pills, absolutely stacked at the bottom-center; the newest
// sits in front and older ones peek out behind it (offset up + scaled down).

const MAX_VISIBLE = 3;

function ToastCard({ data, depth }: { data: Toast; depth: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: "-50%", y: 20, scale: 0.94, filter: "blur(0px)" }}
      animate={{
        opacity: depth >= MAX_VISIBLE ? 0 : 1,
        x: "-50%",
        y: -depth * 12,
        scale: 1 - depth * 0.05,
        // DSLR-style falloff: front card sharp, each one further back blurrier.
        filter: `blur(${depth * 2}px)`,
      }}
      exit={{ opacity: 0, x: "-50%", y: 24, scale: 0.9, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.7 }}
      style={{
        transformOrigin: "bottom center",
        zIndex: 100 - depth,
        pointerEvents: depth >= MAX_VISIBLE ? "none" : "auto",
      }}
      className="absolute bottom-0 left-1/2 flex w-max max-w-[calc(100vw-1.5rem)] items-center gap-2.5 rounded-full border border-[#ead9c9] bg-[#231a12] px-3.5 py-2 shadow-[0_16px_40px_rgba(35,26,18,0.16)]"
      role="status"
      aria-live="polite"
    >
      <p className="whitespace-nowrap text-[13px] font-medium leading-normal text-[#fff1e5]">
        {data.message}
      </p>

      {data.dismissible ? (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => dismissToast(data.id)}
          className="-mr-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#8b7a6c] transition-colors duration-150 hover:bg-[#f9eee4] hover:text-[#231a12]"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      ) : null}
    </motion.div>
  );
}

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.length;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-200">
      <AnimatePresence initial={false}>
        {items.map((t, i) => (
          <ToastCard data={t} depth={total - 1 - i} key={t.id} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
