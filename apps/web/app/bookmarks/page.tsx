"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Raleway } from "next/font/google";

import { ProductCard } from "../../components/product-card";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { useBookmarks, getBookmarkKey } from "../../lib/bookmarks";
import { addManyToEnquiry } from "../../lib/enquiry";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

function EmptyView() {
  return (
    <div className="flex min-h-[72vh] flex-col items-center justify-center px-6 text-center">
      <Image
        alt="No bookmarks"
        className="h-auto w-[210px] opacity-80 sm:w-[300px]"
        height={140}
        src="/illustrations/empty-box.svg"
        width={300}
      />
      <h2
        className={`${raleway.className} mt-7 text-[22px] font-medium tracking-[-0.03em] text-[#231a12] sm:mt-8 sm:text-[26px]`}
      >
        No saved products yet
      </h2>
      <p className="mt-3 max-w-sm text-[13.5px] leading-[1.75] text-[#6f6258] sm:text-[14px] sm:leading-[1.8]">
        Products you bookmark will appear here so you can compare them and raise
        an enquiry when you&apos;re ready.
      </p>
      <Link
        className="mt-8 inline-flex items-center gap-2 rounded-[10px] bg-[#231a12] px-6 py-3 text-[13px] font-semibold text-white transition hover:bg-[#3a2f25]"
        href="/#tyres"
      >
        Browse products
        <svg
          fill="none"
          height="13"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="13"
        >
          <line x1="5" x2="19" y1="12" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}

export default function BookmarksPage() {
  const router = useRouter();
  const { bookmarks, hydrated } = useBookmarks();

  // Avoid flashing the empty state before localStorage has been read.
  const showEmpty = hydrated && bookmarks.length === 0;
  const showList = hydrated && bookmarks.length > 0;

  function handleEnquireAll() {
    addManyToEnquiry(bookmarks);
    router.push("/contact");
  }

  return (
    <main className="min-h-screen text-[#231a12] bg-[#f9eee4]">
      <SiteHeader />

      {showEmpty ? (
        <EmptyView />
      ) : showList ? (
        <section className="px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 max-w-330 mx-auto">
          <div className="mx-auto max-w-[1480px]">
            <div className="max-w-3xl">
              <h1
                className={`${raleway.className} text-[clamp(1.875rem,6vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[#231a12]`}
              >
                Bookmarked products.
              </h1>

              <p className="mt-3 max-w-2xl text-[13px] font-medium leading-[1.7] text-[#6f6258] sm:mt-5 sm:text-[15px] sm:leading-[1.8]">
                A focused shortlist of tyres worth revisiting. Use this page to
                compare the products you have saved and move quickly into an
                enquiry when you are ready.
              </p>

              <button
                className="group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,111,0.9),transparent_34%),linear-gradient(120deg,#f69300_0%,#d47d00_48%,#6f3f00_100%)] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(246,147,0,0.24)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_30px_rgba(246,147,0,0.32)] sm:mt-7"
                onClick={handleEnquireAll}
                type="button"
              >
                Enquire all ({bookmarks.length})
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {bookmarks.map((product) => (
                <ProductCard
                  className="!min-w-0 !w-full !max-w-none !flex-auto !snap-none"
                  key={getBookmarkKey(product)}
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="min-h-[60vh]" />
      )}

      <SiteFooter />
    </main>
  );
}
