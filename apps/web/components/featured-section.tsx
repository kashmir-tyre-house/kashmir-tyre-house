import Image from "next/image";
import { Button } from "@kth/ui";
import { Raleway, Inter } from "next/font/google";

const karla = Inter({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap"
});

const featuredProducts = [
  {
    brand: "MRF",
    category: "Highway Truck Tyre",
    productName: "Highway Pro HP-300",
    primarySize: "295/80 R22.5",
    availableSizesCount: 6,
    application: "Truck / Highway",
    keyFeature: "High load capacity",
    loadIndex: "152/148",
    image: "/images/tyre-image.jpeg",
  },
  {
    brand: "Apollo",
    category: "Mixed Service Tyre",
    productName: "TerraGrip MX",
    primarySize: "10.00 R20",
    availableSizesCount: 4,
    application: "Mixed Service",
    keyFeature: "Strong road grip",
    loadIndex: "146/143",
    image: "/images/tyre-image.jpeg",
  },
  {
    brand: "CEAT",
    category: "Light Truck Tyre",
    productName: "UrbanRide CT-90",
    primarySize: "215/75 R15",
    availableSizesCount: 8,
    application: "Light Truck",
    keyFeature: "Long tread life",
    loadIndex: "110/108",
    image: "/images/tyre-image.jpeg",
  },
  {
    brand: "JK Tyre",
    category: "Off-Road Tyre",
    productName: "OffRoad Beast OR-X",
    primarySize: "385/65 R22.5",
    availableSizesCount: 5,
    application: "Off-Road / Site",
    keyFeature: "Rugged terrain ready",
    loadIndex: "160",
    image: "/images/tyre-image.jpeg",
  },
  {
    brand: "Bridgestone",
    category: "Regional Haul Tyre",
    productName: "Duratrail RH-7",
    primarySize: "11.00 R20",
    availableSizesCount: 3,
    application: "Regional Transport",
    keyFeature: "Stable long-haul wear",
    loadIndex: "150/146",
    image: "/images/home-image-2.png",
  },
  {
    brand: "Goodyear",
    category: "Construction Tyre",
    productName: "SiteMaster XM",
    primarySize: "315/80 R22.5",
    availableSizesCount: 5,
    application: "Construction / Fleet",
    keyFeature: "Cut-resistant compound",
    loadIndex: "156/150",
    image: "/images/home-image-4.png",
  },
  {
    brand: "Yokohama",
    category: "All-Terrain Tyre",
    productName: "RoadTerrain AT-5",
    primarySize: "265/70 R19.5",
    availableSizesCount: 4,
    application: "Utility / Mixed Terrain",
    keyFeature: "Balanced grip and mileage",
    loadIndex: "140/137",
    image: "/images/home-image-1.png",
  },
];

function BookmarkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function FeaturedSection() {
  return (
    <section
      aria-labelledby="featured-heading"
      className="px-4 text-[#231a12] sm:px-6 lg:px-8 lg:pt-16"
      id="tyres"
    >
      <h2
        className={`${raleway.className} mt-3 font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px] place-self-center mb-10`}
        id="services-heading"
      >
        Featured Products
      </h2>

      {/* Centered title + CTA button */}
      <div className="mt-3 flex flex-col items-center gap-6 text-center">
        <h2
          className={`${raleway.className} max-w-2xl font-medium leading-tight tracking-[-0.03em] text-[#231a12] text-[26px] sm:text-[32px] lg:text-[24px]`}
          id="featured-heading"
        >
          Tyres our customers keep coming back for.
        </h2>

        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#231a12]/25 bg-transparent px-5 text-[13px] font-bold text-[#231a12] transition-all duration-300 hover:border-[#231a12] hover:bg-[#231a12] hover:text-[#fff8f5]"
          type="button"
        >
          View all products
          <ArrowIcon />
        </button>
      </div>

      {/* Cards */}
      <div className="mx-auto mt-10 max-w-330">
        <div
          className={`${karla.className} flex snap-x snap-mandatory gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#f9eee4] h-fit pb-10 pz-10`}
        >
          {featuredProducts.map((product) => (
            <article
              className="group h-fit min-w-[312px] w-fit flex-none snap-start overflow-hidden rounded-[22px] border border-[#ead9c9] bg-white shadow-[0_14px_44px_rgba(35,26,18,0.07)] transition-[border-color,box-shadow] duration-300 hover:border-[#d8b997]"
              key={product.productName}
            >
              {/* Image area */}
              <div className="relative bg-[#c0b3a6] p-2 rounded-[20px]">
                <div className="relative flex h-[160px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_45%,rgba(246,147,0,0.14),transparent_38%),linear-gradient(180deg,#fff7ef_0%,#ead8c8_100%)]">
                  <Image
                    alt={`${product.brand} ${product.productName}`}
                    className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    fill
                    sizes="(min-width: 1280px) 260px, (min-width: 768px) 45vw, 92vw"
                    src={product.image}
                  />

                  {/* Brand chip — replaces plain text */}
                  <span className="absolute bottom-2.5 left-2.5 z-20 inline-flex items-center rounded-[6px] border border-[#F3E7DB]/40 bg-white/30 px-2.5 py-0.5 backdrop-blur-md">
                    <span className="text-[9px] font-medium tracking-[0.1em] text-[#f9eee4]">
                      {product.brand}
                    </span>
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 hover:cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="whitespace-nowrap text-[19px] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#231a12]">
                    {product.productName}
                  </h3>

                  <button
                    aria-label={`Save ${product.productName}`}
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#F3E7DB] text-[#231a12] shadow-[0_8px_20px_rgba(35,26,18,0.08)] transition-colors duration-300 hover:text-[#f69300]"
                    type="button"
                  >
                    <BookmarkIcon />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-[#8b7a6c]">Primary Size</p>
                    <p className="mt-1 whitespace-nowrap text-[13px] font-bold leading-tight text-[#231a12]">
                      {product.primarySize}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#8b7a6c]">Load Index</p>
                    <p className="mt-1 whitespace-nowrap text-[13px] font-bold leading-tight text-[#231a12]">
                      {product.loadIndex}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#8b7a6c]">Application</p>
                    <p className="mt-1 whitespace-nowrap text-[13px] font-semibold leading-tight text-[#231a12]">
                      {product.application}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#8b7a6c]">Feature</p>
                    <p className="mt-1 whitespace-nowrap text-[13px] font-semibold leading-tight text-[#231a12]">
                      {product.keyFeature}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button
                    className="h-9 flex-1 rounded-md bg-[linear-gradient(135deg,#ffae2b_0%,#f69300_42%,#a85d00_100%)] px-3 text-[12px] font-extrabold text-[#231a12] shadow-[0_10px_22px_rgba(246,147,0,0.2)] transition-transform duration-3000 hover:brightness-110"
                    size="sm"
                  >
                    Enquire
                  </Button>

                  <Button
                    className="h-9 rounded-md border border-[#231a12]/20 bg-transparent px-3 text-[12px] font-bold text-[#231a12] transition-colors duration-300  hover:bg-[white]"
                    size="sm"
                    variant="secondary"
                  >
                    Details
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
