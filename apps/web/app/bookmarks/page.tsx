import { Raleway } from "next/font/google";

import { ProductCard } from "../../components/product-card";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { bookmarkedProducts } from "../../lib/products";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

export default function BookmarksPage() {
  return (
    <main className="min-h-screen bg-[#f9eee4] text-[#231a12]">
      <SiteHeader />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8 max-w-330 mx-auto">
        <div className="mx-auto max-w-[1480px]">
          <div className="max-w-3xl">
            <h1
              className={`${raleway.className} mt-6 text-[38px] font-medium leading-[0.96] tracking-[-0.04em] text-[#231a12] sm:text-[52px] lg:text-[64px]`}
            >
              Bookmarked products.
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] font-medium leading-[1.8] text-[#6f6258]">
              A focused shortlist of tyres worth revisiting. Use this page to
              compare the products you have saved and move quickly into an
              enquiry when you are ready.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-start gap-5">
            {bookmarkedProducts.map((product) => (
              <ProductCard
                className="!min-w-[290px] !max-w-[340px] !w-full !flex-[1_1_290px] !snap-none"
                key={product.productName}
                product={product}
              />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
