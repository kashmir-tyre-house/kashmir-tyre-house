"use client";

import { Button } from "@kth/ui";
import { RotateCcw } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <h1 className="font-display text-3xl font-bold">
          Admin dashboard could not load.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Retry the request, then check API and database environment variables
          if the issue continues.
        </p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw size={18} />
          Retry
        </Button>
      </section>
    </main>
  );
}
