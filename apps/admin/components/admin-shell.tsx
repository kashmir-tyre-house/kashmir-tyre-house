"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";
import { Toaster } from "sonner";

import { AdminSidebar, AdminTopbar } from "./admin-sidebar";

const SIDEBAR_STORAGE_KEY = "kth-admin-sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "kth-admin-sidebar-storage";
let canReadSavedSidebarState = false;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <>
      <Toaster
        closeButton
        position="top-center"
        richColors
        toastOptions={{
          classNames: {
            toast:
              "border border-[#e8e7ec] bg-white text-[#2d2c33] shadow-[0_18px_48px_rgba(45,44,51,0.18)]",
            title: "text-sm font-semibold",
            description: "text-xs text-[#6e6d78]"
          }
        }}
      />

      {isPublicAuthPath(pathname) ? (
        children
      ) : (
        <SessionProvider>
          <div className="admin-app-frame min-h-dvh bg-[#2D2C33]">
            <Suspense fallback={null}>
              <AdminSidebar collapsed={collapsed} onToggle={toggleSidebar} />
            </Suspense>
            <div
              className={[
                "min-h-dvh bg-[#2D2C33] transition-[padding] duration-300 ease-out",
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
        </SessionProvider>
      )}
    </>
  );
}

function subscribeToSidebarState(callback: () => void) {
  canReadSavedSidebarState = true;
  queueMicrotask(callback);

  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, callback);
  };
}

function getSidebarState() {
  if (!canReadSavedSidebarState) {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getServerSidebarState() {
  return false;
}

function isPublicAuthPath(pathname: string) {
  return (
    pathname.startsWith("/login") || pathname.startsWith("/forgot-password")
  );
}
