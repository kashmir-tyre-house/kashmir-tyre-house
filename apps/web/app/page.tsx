export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center">
        <p className="text-sm font-semibold uppercase text-[var(--accent)]">
          Frontend app
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          Kashmir Tyre House
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Public customer portal scaffold is ready for the product catalogue,
          wishlist, filters, and enquiry flow.
        </p>
      </section>
    </main>
  );
}
