"use client";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4">
      <section className="max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Frontend app could not load.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Please retry the request.
        </p>
        <button
          className="mt-6 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)]"
          onClick={reset}
          type="button"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
