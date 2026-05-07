import { PageLoadingAnimation } from "../components/page-loading-animation";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-6">
      <PageLoadingAnimation />
    </main>
  );
}
