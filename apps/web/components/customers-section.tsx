import Image from "next/image";
import { Raleway } from "next/font/google";

import { Reveal } from "./reveal";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const customers = [
  { name: "JSW Group", logo: "/images/customer-logo-images/JSW_Group_logo.svg.png" },
  { name: "Jindal Steel & Power", logo: "/images/customer-logo-images/Jindal_Steel_and_Power_Logo.png" },
  { name: "Birla Group", logo: "/images/customer-logo-images/birla_group_logo.png" },
  { name: "Durga Mining", logo: "/images/customer-logo-images/durga_mining_logo.webp" },
  { name: "Hindalco", logo: "/images/customer-logo-images/hindalco_logo.png" },
  { name: "Navayuga", logo: "/images/customer-logo-images/navayuga_logo.png" },
  { name: "Tata Steel", logo: "/images/customer-logo-images/tata_steel_logo.svg" },
  { name: "Thriveny", logo: "/images/customer-logo-images/thriveny_logo.svg" },
  { name: "UltraTech", logo: "/images/customer-logo-images/ultratech_logo.png" },
  { name: "Vedanta", logo: "/images/customer-logo-images/vedanta_logo.png" },
];

const allItems = [...customers, ...customers];

export function CustomersSection() {
  return (
    <section
      aria-labelledby="customers-heading"
      className="py-20 overflow-hidden"
      id="customers"
    >
      <style>{`
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
      `}</style>
      <div className="mx-auto max-w-[1480px] px-8">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center" distance="sm">
          <h2
            className={`${raleway.className} mt-5 text-[30px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px]`}
            id="customers-heading"
          >
            Our Customers
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.8] text-[#6f6258]">
            Trusted by leading industrial conglomerates, mining operations, and
            steel giants across India for their critical tyre requirements.
          </p>
        </Reveal>
      </div>

      {/* Marquee track */}
      <div
        className="relative w-full"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div
          className="flex"
          style={{
            width: "max-content",
            animation: "marquee-right 32s linear infinite",
          }}
        >
          {allItems.map((customer, i) => (
            <div
              key={i}
              className="mx-5 flex w-[180px] flex-shrink-0 flex-col items-center gap-4 rounded-2xl border border-[#ead9c9] bg-white px-5 py-6 shadow-[0_4px_18px_rgba(35,26,18,0.05)]"
            >
              <div className="relative h-16 w-full">
                <Image
                  alt={`${customer.name} logo`}
                  className="object-contain"
                  fill
                  sizes="160px"
                  src={customer.logo}
                />
              </div>
              <span className="text-center text-[12px] font-semibold tracking-[0.03em] text-[#544434]">
                {customer.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
