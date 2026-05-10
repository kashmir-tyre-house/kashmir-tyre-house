"use client";

import {
  ChevronsUpDown,
  CircleGauge,
  LayoutDashboard,
  MessageSquareText,
  PanelLeft,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Enquiries",
    href: "/enquiries",
    icon: MessageSquareText,
  },
  {
    label: "Tyres",
    href: "/tyres",
    icon: CircleGauge,
  },
  {
    label: "Brands",
    href: "/brands",
    icon: Tags,
  },
];

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "admin-sidebar-shell fixed inset-y-0 left-0 z-30 hidden overflow-hidden text-white transition-[width] duration-300 ease-out lg:block",
        collapsed ? "w-17" : "w-60",
      ].join(" ")}
    >
      <div className="relative z-10 flex h-full flex-col px-3 py-3">
        <div className="flex items-center gap-3 mt-2">
          <Link
            className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-[11px] font-bold tracking-[-0.03em] text-[#17213a] shadow-[0_16px_32px_rgba(0,0,0,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href="/dashboard"
          >
            KTH
          </Link>
          <div
            className={[
              "min-w-0 transition duration-200",
              collapsed ? "pointer-events-none w-0 opacity-0" : "opacity-100",
            ].join(" ")}
          >
            <p className="mt-0.5 truncate text-[11px] font-medium text-white/75">
              Kashmir Tyre House <br /> Private Limited
            </p>
          </div>
        </div>

        <div className="mt-5 h-px bg-white/12" />

        <nav className={`${collapsed ? "mt-0" : "mt-4"} flex-1`}>
          {!collapsed ? (
            <p className="px-1 text-[10px] font-semibold tracking-wide text-white/40 uppercase">Platform</p>
          ) : null}

          <ul className="mt-4 space-y-1">
            {navItems.map((item) => {
              const isParentActive = isNavItemActive(item, pathname);
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <Link
                    className={[
                      "group flex h-10 items-center rounded-[10px] text-[13px] transition duration-200 ease-out mt-1.5",
                      "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white",
                      collapsed ? "justify-center" : "gap-2.5 px-3",
                      isParentActive
                        ? "bg-(--sidebar-highlight) text-white"
                        : "text-white/55 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon aria-hidden className="size-4.5 shrink-0" />
                    {!collapsed ? (
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/12 pt-2">
          <button
            className={[
              "flex w-full items-center rounded-xl text-left text-white transition duration-200 hover:bg-white/6 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white",
              collapsed ? "justify-center p-1" : "gap-2.5 p-2",
            ].join(" ")}
            type="button"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#e8f2fb] text-[11px] font-semibold text-[#3d4653]">
              AD
            </span>
            {!collapsed ? (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">
                    admin
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] font-normal text-white/60">
                    admin@gmail.com
                  </span>
                </span>
                <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-white/40" />
              </>
            ) : null}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AdminTopbar({
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const pageTitle =
    navItems.find((item) => isNavItemActive(item, pathname))?.label ??
    "Dashboard";

  return (
    <header className="flex h-13 shrink-0 items-center justify-between border-b border-(--border) px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex items-center justify-center rounded-md text-[#07162d] transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#07162d]"
          onClick={onToggle}
          type="button"
        >
          <PanelLeft aria-hidden className="size-4" />
        </button>
        <span className="h-6 w-px bg-(--border)" />
        <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#07162d]">
          {pageTitle}
        </h1>
      </div>
    </header>
  );
}

function isNavItemActive(
  item: NavItem,
  pathname: string,
) {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}