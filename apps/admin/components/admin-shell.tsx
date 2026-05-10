"use client";

import { Suspense, useSyncExternalStore } from "react";

import { AdminSidebar, AdminTopbar } from "./admin-sidebar";

const SIDEBAR_STORAGE_KEY = "kth-admin-sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "kth-admin-sidebar-storage";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribeToSidebarState,
    getSidebarState,
    getServerSidebarState,
  );

  const toggleSidebar = () => {
    const nextValue = !getSidebarState();

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  };

  return (
    <div className="admin-app-frame min-h-dvh bg-[#2D2C33]">
      <Suspense fallback={null}>
        <AdminSidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </Suspense>
      <div
        className={[
          "min-h-dvh transition-[padding] duration-300 ease-out bg-[#2D2C33]",
          collapsed ? "lg:pl-[68px]" : "lg:pl-[240px]",
        ].join(" ")}
      >
        <main className="flex min-h-dvh flex-col overflow-hidden bg-[var(--background)] lg:my-3 lg:mr-3 lg:rounded-[22px]">
          <AdminTopbar collapsed={collapsed} onToggle={toggleSidebar} />
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function subscribeToSidebarState(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, callback);
  };
}

function getSidebarState() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getServerSidebarState() {
  return false;
}
