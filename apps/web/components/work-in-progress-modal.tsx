"use client";

import { Hammer } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kth-wip-acknowledged";

export function WorkInProgressModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      return;
    }
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismiss();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="wip-title"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center px-5"
      role="dialog"
      style={{ animation: "wipFade 0.3s ease both" }}
    >
      <style>{`
        @keyframes wipFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wipPop {
          from { opacity: 0; transform: translateY(8px) scale(0.96) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-wip-card] { animation: none !important }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#1a120b]/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      <div
        data-wip-card
        className="relative w-full max-w-105 overflow-hidden rounded-3xl border border-[#ffeee0]/12 bg-[#2a2017]/95 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        style={{ animation: "wipPop 0.32s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#f8ab59]/60 to-transparent"
        />

        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f8ab59]/30 bg-[#f8ab59]/12 text-[#f8ab59]">
          <Hammer aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
        </div>

        <h2 id="wip-title" className="text-xl font-bold text-white">
          Work in Progress
        </h2>

        <p className="mt-3 text-[15px] leading-relaxed text-white/60">
          Welcome to Kashmir Tyre House! Our website is still being built, so a
          few things may look or behave a little differently. Thanks for your
          patience while we get everything polished.
        </p>

        <button
          className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.95),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] text-[14px] font-bold text-[#231a12] shadow-[0_10px_28px_rgba(246,147,0,0.24)] transition-[filter,box-shadow] duration-300 hover:brightness-110 hover:shadow-[0_14px_34px_rgba(246,147,0,0.32)]"
          onClick={dismiss}
          type="button"
        >
          Okay
        </button>
      </div>
    </div>
  );
}
