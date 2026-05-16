"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type TyreRow = {
  id: string;
  name: string;
  brand: { id: string; name: string } | null;
  category: string | null;
  tyreSize: string;
  pattern: string;
  loadIndex: string | null;
  vehicleType: string | null;
  application: string;
  tyreWeight: number | null;
  isActive: boolean;
  createdAt: string;
};

type SortKey = "name" | "category" | "tyreSize" | "application" | "isActive" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;
const COL_COUNT = 13;

export default function TyresPage() {
  const [tyres, setTyres] = useState<TyreRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          sortBy: sortKey,
          sortDir,
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (statusFilter === "active") params.set("isActive", "true");
        if (statusFilter === "inactive") params.set("isActive", "false");

        const res = await fetch(`/api/tyres?${params}`);
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok) throw new Error(data.message ?? "Failed to fetch.");
        setTyres(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tyres.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sortKey, sortDir, statusFilter, page, refreshKey]);

  function promptDelete(tyre: TyreRow) {
    setDeleteTarget({ id: tyre.id, name: tyre.name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tyres/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRefreshKey((k) => k + 1);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteTarget(null);
      alert(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  const allSelected = tyres.length > 0 && tyres.every((t) => selected.has(t.id));
  const someSelected = tyres.some((t) => selected.has(t.id)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tyres.map((t) => t.id)));
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <>
    <div className="flex flex-1 min-h-0 flex-col gap-5">
      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={[
              "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition",
              statusFilter === "active"
                ? "border-[#16a34a] bg-[#16a34a] text-white"
                : "border-(--border) bg-white text-(--foreground) hover:bg-slate-50",
            ].join(" ")}
            onClick={() => {
              setStatusFilter((f) => (f === "active" ? "all" : "active"));
              setPage(1);
            }}
          >
            Active
          </button>
          <button
            className={[
              "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition",
              statusFilter === "inactive"
                ? "border-[#dc2626] bg-[#dc2626] text-white"
                : "border-(--border) bg-white text-(--foreground) hover:bg-slate-50",
            ].join(" ")}
            onClick={() => {
              setStatusFilter((f) => (f === "inactive" ? "all" : "inactive"));
              setPage(1);
            }}
          >
            Inactive
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 ? (
            <span className="text-[13px] text-(--muted-foreground)">
              {selected.size} selected
            </span>
          ) : null}
          <Link
            className="flex h-8 items-center gap-1.5 rounded-lg bg-(--foreground) px-3 text-[13px] font-medium text-white transition hover:opacity-90"
            href="/tyres/new"
          >
            <Plus className="size-3.5" />
            New Product
          </Link>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-(--border) bg-white">
        {/* Scrollable table area */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <table
            className="h-full border-collapse text-[13px]"
            style={{ width: "max-content", minWidth: "100%" }}
          >
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-(--border) bg-[#f9fafb]">
                <th className="w-12 py-3 pl-4">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </th>
                <PlainTh className="w-36 min-w-36">ID</PlainTh>
                <SortTh label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} className="min-w-50" />
                <PlainTh className="w-36 min-w-36">Brand</PlainTh>
                <SortTh label="Category" sortKey="category" current={sortKey} dir={sortDir} onSort={handleSort} className="w-28 min-w-28" />
                <SortTh label="Tyre Size" sortKey="tyreSize" current={sortKey} dir={sortDir} onSort={handleSort} className="w-36 min-w-36" />
                <PlainTh className="w-28 min-w-28">Pattern</PlainTh>
                <PlainTh className="w-32 min-w-32">Load Index</PlainTh>
                <PlainTh className="w-56 min-w-56">Vehicle Type</PlainTh>
                <SortTh label="Application" sortKey="application" current={sortKey} dir={sortDir} onSort={handleSort} className="w-36 min-w-36" />
                <PlainTh className="w-32 min-w-32">Weight (kg)</PlainTh>
                <SortTh label="Status" sortKey="isActive" current={sortKey} dir={sortDir} onSort={handleSort} className="w-28 min-w-28" />
                <th className="w-24 min-w-24 px-4 py-3 text-right font-semibold text-(--foreground)">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--border)">
              {loading ? (
                <tr>
                  <td colSpan={COL_COUNT} className="py-24 text-center text-[13px] text-(--muted-foreground)">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={COL_COUNT} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-[13px] text-red-500">{error}</p>
                      <button
                        className="rounded-lg border border-(--border) bg-white px-3 py-1.5 text-[13px] font-medium text-(--foreground) transition hover:bg-slate-50"
                        onClick={() => setRefreshKey((k) => k + 1)}
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : tyres.length === 0 ? (
                <tr>
                  <td colSpan={COL_COUNT} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Image
                        alt="No products"
                        className="opacity-80"
                        height={96}
                        src="/Illustrations/empty-box.png"
                        width={96}
                      />
                      <p className="text-[13px] font-medium text-(--foreground)">
                        No tyre products found
                      </p>
                      <p className="text-[12px] text-(--muted-foreground)">
                        Add your first product to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tyres.map((tyre) => {
                  const isChecked = selected.has(tyre.id);
                  const isDeleting = deletingId === tyre.id;
                  return (
                    <tr
                      key={tyre.id}
                      className={[
                        "group transition-colors",
                        isChecked ? "bg-slate-50" : "hover:bg-[#fafafa]",
                        isDeleting ? "pointer-events-none opacity-50" : "",
                      ].join(" ")}
                    >
                      <td className="py-3.5 pl-4">
                        <Checkbox checked={isChecked} onChange={() => toggleRow(tyre.id)} />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-(--muted-foreground)">
                        {tyre.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-(--foreground)">{tyre.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-(--muted-foreground)">
                        {tyre.brand?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {tyre.category ? (
                          <span
                            className={[
                              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                              tyre.category === "Radial"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700",
                            ].join(" ")}
                          >
                            {tyre.category}
                          </span>
                        ) : (
                          <span className="text-(--muted-foreground)">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-(--foreground)">
                        {tyre.tyreSize}
                      </td>
                      <td className="px-4 py-3.5 text-(--muted-foreground)">{tyre.pattern}</td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-(--foreground)">
                        {tyre.loadIndex ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-(--muted-foreground)">
                        <span className="line-clamp-1">{tyre.vehicleType ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-(--muted-foreground)">{tyre.application}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-[12px] text-(--muted-foreground)">
                        {tyre.tyreWeight != null ? tyre.tyreWeight.toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge active={tyre.isActive} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Link
                            aria-label="Edit"
                            className="flex size-7 items-center justify-center rounded-lg border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50 hover:text-(--foreground)"
                            href={`/tyres/${tyre.id}/edit`}
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <button
                            aria-label="Delete"
                            className="flex size-7 items-center justify-center rounded-lg border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] transition hover:bg-[#fee2e2]"
                            onClick={() => promptDelete(tyre)}
                            type="button"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-(--border) px-4 py-3">
          <p className="text-[12px] text-(--muted-foreground)">
            {total === 0
              ? "No results"
              : `${from}–${to} of ${total} tyre${total !== 1 ? "s" : ""}`}
          </p>

          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              className="flex size-7 items-center justify-center rounded-lg border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50 hover:text-(--foreground) disabled:pointer-events-none disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                aria-current={p === page ? "page" : undefined}
                className={[
                  "flex size-7 items-center justify-center rounded-lg border text-[12px] font-medium transition",
                  p === page
                    ? "border-(--foreground) bg-(--foreground) text-white"
                    : "border-(--border) bg-white text-(--muted-foreground) hover:bg-slate-50 hover:text-(--foreground)",
                ].join(" ")}
                onClick={() => setPage(p)}
                type="button"
              >
                {p}
              </button>
            ))}

            <button
              aria-label="Next page"
              className="flex size-7 items-center justify-center rounded-lg border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50 hover:text-(--foreground) disabled:pointer-events-none disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    {deleteTarget ? (
      <ConfirmDeleteModal
        deleting={deletingId !== null}
        name={deleteTarget.name}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    ) : null}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      aria-checked={indeterminate ? "mixed" : checked}
      className="flex size-5 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--foreground)"
      onClick={onChange}
      role="checkbox"
      type="button"
    >
      {checked || indeterminate ? (
        <span className="flex size-5 items-center justify-center rounded bg-(--foreground)">
          {indeterminate ? (
            <span className="block h-px w-2.5 rounded-full bg-white" />
          ) : (
            <svg
              className="size-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 12 12"
            >
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      ) : (
        <span className="block size-5 rounded border border-[#d0d5dd] bg-white" />
      )}
    </button>
  );
}

function PlainTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={["px-4 py-3 text-left font-semibold text-(--foreground)", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </th>
  );
}

function SortTh({
  label,
  sortKey,
  current,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = current === sortKey;
  return (
    <th className={["px-4 py-3 text-left", className].filter(Boolean).join(" ")}>
      <button
        className="flex items-center gap-1 font-semibold text-(--foreground) focus-visible:outline-none"
        onClick={() => onSort(sortKey)}
        type="button"
      >
        {label}
        <ArrowUpDown
          className={["size-3", active ? "text-(--foreground)" : "text-[#c0c8d5]"].join(" ")}
        />
      </button>
    </th>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium",
        active ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fef2f2] text-[#dc2626]",
      ].join(" ")}
    >
      <span
        className={["size-1.5 rounded-full", active ? "bg-[#16a34a]" : "bg-[#dc2626]"].join(" ")}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ConfirmDeleteModal({
  name,
  deleting,
  onConfirm,
  onCancel,
}: {
  name: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={deleting ? undefined : onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-(--border) bg-white p-6 shadow-2xl">
        {/* Icon */}
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="size-4.5 text-red-500" />
        </div>

        <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-(--foreground)">
          Delete product?
        </h2>
        <p className="mt-1.5 text-[13px] text-(--muted-foreground)">
          <span className="font-medium text-(--foreground)">{name}</span>{" "}
          will be permanently deleted. This action cannot be undone.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            className="flex h-9 items-center rounded-lg border border-(--border) bg-white px-4 text-[13px] font-medium text-(--foreground) transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            disabled={deleting}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-[13px] font-medium text-white transition hover:bg-red-700 disabled:pointer-events-none disabled:opacity-60"
            disabled={deleting}
            onClick={onConfirm}
            type="button"
          >
            <Trash2 className="size-3.5" />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
