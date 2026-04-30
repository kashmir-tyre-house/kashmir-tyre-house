export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="h-14 animate-pulse rounded-lg bg-[var(--muted)]" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-28 animate-pulse rounded-lg bg-[var(--muted)]" />
          <div className="h-28 animate-pulse rounded-lg bg-[var(--muted)]" />
          <div className="h-28 animate-pulse rounded-lg bg-[var(--muted)]" />
          <div className="h-28 animate-pulse rounded-lg bg-[var(--muted)]" />
        </div>
        <div className="h-80 animate-pulse rounded-lg bg-[var(--muted)]" />
      </div>
    </main>
  );
}
