"use client";

import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type TyreRow = {
  id: string;
  name: string;
  brand: string;
  category: "Radial" | "Bias";
  tyreSize: string;
  pattern: string;
  loadIndex: string;
  vehicleType: string;
  application: string;
  tyreWeight: string;
  isActive: boolean;
  createdAt: string;
};

const DUMMY_TYRES: TyreRow[] = [
  {
    id: "TP-0001",
    name: "XDR Minemaster 40",
    brand: "CEAT",
    category: "Radial",
    tyreSize: "27.00 R49",
    pattern: "XDR",
    loadIndex: "210A2",
    vehicleType: "Earthmover",
    application: "Mining",
    tyreWeight: "540.00",
    isActive: true,
    createdAt: "03/25/24 - 18:45",
  },
  {
    id: "TP-0002",
    name: "Loadpro HD 12",
    brand: "Apollo",
    category: "Bias",
    tyreSize: "12.00-20",
    pattern: "Loadpro",
    loadIndex: "154/150",
    vehicleType: "Industrial",
    application: "On-Highway",
    tyreWeight: "89.50",
    isActive: true,
    createdAt: "03/25/24 - 12:30",
  },
  {
    id: "TP-0003",
    name: "GoldenRock R500",
    brand: "BKT",
    category: "Radial",
    tyreSize: "20.5 R25",
    pattern: "ROCK",
    loadIndex: "177A2",
    vehicleType: "Loader and dozer",
    application: "Construction",
    tyreWeight: "310.00",
    isActive: true,
    createdAt: "03/24/24 - 15:20",
  },
  {
    id: "TP-0004",
    name: "CompactorKing CK2",
    brand: "Michelin",
    category: "Bias",
    tyreSize: "23.1-26",
    pattern: "CK2",
    loadIndex: "168A8",
    vehicleType: "Compactor",
    application: "Compaction",
    tyreWeight: "210.75",
    isActive: false,
    createdAt: "03/23/24 - 10:55",
  },
  {
    id: "TP-0005",
    name: "Underground Pro UP9",
    brand: "Continental",
    category: "Radial",
    tyreSize: "17.5 R25",
    pattern: "UP9",
    loadIndex: "169B",
    vehicleType: "Underground",
    application: "Mining",
    tyreWeight: "195.00",
    isActive: false,
    createdAt: "03/23/24 - 04:30",
  },
  {
    id: "TP-0006",
    name: "GraderMaster GM5",
    brand: "CEAT",
    category: "Radial",
    tyreSize: "17.5 R25",
    pattern: "GM5",
    loadIndex: "169A2",
    vehicleType: "Grader",
    application: "Road Works",
    tyreWeight: "185.50",
    isActive: true,
    createdAt: "03/22/24 - 17:15",
  },
  {
    id: "TP-0007",
    name: "MobileCrane MCR1",
    brand: "Bridgestone",
    category: "Radial",
    tyreSize: "385/95 R25",
    pattern: "MCR",
    loadIndex: "170E",
    vehicleType: "Mobile crane (High-speed)",
    application: "Crane",
    tyreWeight: "162.00",
    isActive: true,
    createdAt: "03/22/24 - 11:40",
  },
  {
    id: "TP-0008",
    name: "LoggerX LX4",
    brand: "BKT",
    category: "Bias",
    tyreSize: "30.5-32",
    pattern: "LX4",
    loadIndex: "182A8",
    vehicleType: "Mining and Logging",
    application: "Forestry",
    tyreWeight: "430.00",
    isActive: true,
    createdAt: "03/21/24 - 14:05",
  },
  {
    id: "TP-0009",
    name: "IndustrialFlex IF2",
    brand: "Apollo",
    category: "Bias",
    tyreSize: "8.25-15",
    pattern: "IF2",
    loadIndex: "148A5",
    vehicleType: "Industrial",
    application: "Warehouse",
    tyreWeight: "52.30",
    isActive: true,
    createdAt: "03/21/24 - 09:20",
  },
  {
    id: "TP-0010",
    name: "EarthstarE30 Radial",
    brand: "Michelin",
    category: "Radial",
    tyreSize: "29.5 R29",
    pattern: "E3R",
    loadIndex: "192A2",
    vehicleType: "Earthmover",
    application: "Mining",
    tyreWeight: "610.00",
    isActive: false,
    createdAt: "03/21/24 - 09:15",
  },
];

type SortKey = keyof TyreRow;
type SortDir = "asc" | "desc";

export default function TyresPage() {
  const PAGE_SIZE = 7;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const filtered = DUMMY_TYRES.filter((t) => {
    if (statusFilter === "active") return t.isActive;
    if (statusFilter === "inactive") return !t.isActive;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp =
      typeof av === "boolean"
        ? Number(av) - Number(bv)
        : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allSelected = pageRows.length > 0 && pageRows.every((t) => selected.has(t.id));
  const someSelected = pageRows.some((t) => selected.has(t.id)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageRows.map((t) => t.id)));
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

  return (
    <div className="flex flex-col gap-5">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={[
              "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition",
              statusFilter === "all"
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-slate-50",
            ].join(" ")}
            onClick={() => { setStatusFilter("all"); setPage(1); }}
          >
            All
            <ChevronDown className="size-3.5 opacity-60" />
          </button>
          <button
            className={[
              "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition",
              statusFilter === "active"
                ? "border-[#16a34a] bg-[#16a34a] text-white"
                : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-slate-50",
            ].join(" ")}
            onClick={() => { setStatusFilter("active"); setPage(1); }}
          >
            Active
          </button>
          <button
            className={[
              "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition",
              statusFilter === "inactive"
                ? "border-[#dc2626] bg-[#dc2626] text-white"
                : "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-slate-50",
            ].join(" ")}
            onClick={() => { setStatusFilter("inactive"); setPage(1); }}
          >
            Inactive
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 ? (
            <span className="text-[13px] text-[var(--muted-foreground)]">
              {selected.size} selected
            </span>
          ) : null}
          <button className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-slate-50">
            <SlidersHorizontal className="size-3.5" />
            Filter
          </button>
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
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <div className="overflow-x-auto">
          <table className="border-collapse text-[13px]" style={{ width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr className="border-b border-[var(--border)] bg-[#f9fafb]">
                {/* Select all */}
                <th className="w-12 py-3 pl-4">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </th>

                <SortTh label="ID" sortKey="id" current={sortKey} dir={sortDir} onSort={handleSort} className="w-28 min-w-28" />
                <SortTh label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} className="min-w-50" />
                <SortTh label="Brand" sortKey="brand" current={sortKey} dir={sortDir} onSort={handleSort} className="w-36 min-w-36" />
                <SortTh label="Category" sortKey="category" current={sortKey} dir={sortDir} onSort={handleSort} className="w-28 min-w-28" />
                <SortTh label="Tyre Size" sortKey="tyreSize" current={sortKey} dir={sortDir} onSort={handleSort} className="w-36 min-w-36" />
                <SortTh label="Pattern" sortKey="pattern" current={sortKey} dir={sortDir} onSort={handleSort} className="w-28 min-w-28" />
                <SortTh label="Load Index" sortKey="loadIndex" current={sortKey} dir={sortDir} onSort={handleSort} className="w-32 min-w-32" />
                <SortTh label="Vehicle Type" sortKey="vehicleType" current={sortKey} dir={sortDir} onSort={handleSort} className="w-56 min-w-56" />
                <SortTh label="Weight (kg)" sortKey="tyreWeight" current={sortKey} dir={sortDir} onSort={handleSort} className="w-32 min-w-32" />
                <th className="w-28 min-w-28 px-4 py-3 text-left font-semibold text-(--foreground)">Status</th>
                <th className="w-24 min-w-24 px-4 py-3 text-right font-semibold text-(--foreground)">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {pageRows.map((tyre) => {
                const isChecked = selected.has(tyre.id);
                return (
                  <tr
                    key={tyre.id}
                    className={[
                      "group transition-colors",
                      isChecked ? "bg-slate-50" : "hover:bg-[#fafafa]",
                    ].join(" ")}
                  >
                    <td className="py-3.5 pl-4">
                      <Checkbox checked={isChecked} onChange={() => toggleRow(tyre.id)} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-[var(--muted-foreground)]">
                      {tyre.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-[var(--foreground)]">{tyre.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--muted-foreground)]">{tyre.brand}</td>
                    <td className="px-4 py-3.5">
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
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-[var(--foreground)]">
                      {tyre.tyreSize}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--muted-foreground)]">{tyre.pattern}</td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-[var(--foreground)]">
                      {tyre.loadIndex}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                      <span className="line-clamp-1">{tyre.vehicleType}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-[var(--muted-foreground)]">
                      {tyre.tyreWeight}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge active={tyre.isActive} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <ActionBtn icon={<Pencil className="size-3.5" />} label="Edit" />
                        <ActionBtn icon={<Trash2 className="size-3.5" />} label="Delete" danger />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <p className="text-[12px] text-[var(--muted-foreground)]">
            {sorted.length === 0
              ? "No results"
              : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, sorted.length)} of ${sorted.length} tyre${sorted.length !== 1 ? "s" : ""}`}
          </p>

          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              className="flex size-7 items-center justify-center rounded-lg border border-(--border) bg-white text-(--muted-foreground) transition hover:bg-slate-50 hover:text-(--foreground) disabled:pointer-events-none disabled:opacity-40"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                aria-current={p === safePage ? "page" : undefined}
                className={[
                  "flex size-7 items-center justify-center rounded-lg border text-[12px] font-medium transition",
                  p === safePage
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
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
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
      className="flex size-5 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--foreground)]"
      onClick={onChange}
      role="checkbox"
      type="button"
    >
      {checked || indeterminate ? (
        <span className="flex size-5 items-center justify-center rounded bg-[var(--foreground)]">
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
        className="flex items-center gap-1 font-semibold text-[var(--foreground)] hover:text-[var(--foreground)] focus-visible:outline-none"
        onClick={() => onSort(sortKey)}
        type="button"
      >
        {label}
        <ArrowUpDown
          className={[
            "size-3",
            active ? "text-[var(--foreground)]" : "text-[#c0c8d5]",
          ].join(" ")}
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
        active
          ? "bg-[#f0fdf4] text-[#16a34a]"
          : "bg-[#fef2f2] text-[#dc2626]",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          active ? "bg-[#16a34a]" : "bg-[#dc2626]",
        ].join(" ")}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ActionBtn({
  icon,
  label,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={[
        "flex size-7 items-center justify-center rounded-lg border transition",
        danger
          ? "border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]"
          : "border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:bg-slate-50 hover:text-[var(--foreground)]",
      ].join(" ")}
      type="button"
    >
      {icon}
    </button>
  );
}
