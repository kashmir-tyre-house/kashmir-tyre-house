import { Raleway } from "next/font/google";

import { BlurText } from "./blur-text";
import { Reveal } from "./reveal";
import { LogoCloud } from "./ui/logo-cloud";

const raleway = Raleway({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const customers = [
  { src: "/images/customer-logo-images/JSW_Group_logo.svg.png", alt: "JSW Group" },
  { src: "/images/customer-logo-images/Jindal_Steel_and_Power_Logo.png", alt: "Jindal Steel & Power" },
  { src: "/images/customer-logo-images/birla_group_logo.png", alt: "Birla Group" },
  { src: "/images/customer-logo-images/durga_mining_logo.webp", alt: "Durga Mining" },
  { src: "/images/customer-logo-images/hindalco_logo.png", alt: "Hindalco" },
  { src: "/images/customer-logo-images/navayuga_logo.png", alt: "Navayuga" },
  { src: "/images/customer-logo-images/tata_steel_logo.svg", alt: "Tata Steel" },
  { src: "/images/customer-logo-images/thriveny_logo.svg", alt: "Thriveny" },
  { src: "/images/customer-logo-images/ultratech_logo.png", alt: "UltraTech" },
  { src: "/images/customer-logo-images/vedanta_logo.png", alt: "Vedanta" },
];

export function CustomersSection() {
  return (
    <section
      aria-labelledby="customers-heading"
      className="relative overflow-hidden py-24 sm:py-20 mt-12"
      id="customers"
    >
      {/* Soft radial glow behind the cloud */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(246,147,0,0.08),transparent_60%)] blur-[30px]"
      />

      <div className="mx-auto max-w-3xl px-6">
        <h2
          className={`${raleway.className} text-center text-[26px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[34px] lg:text-[40px]`}
          id="customers-heading"
        >
          <span className="text-[#9b8d82]">
            <BlurText text="Trusted across India by" delay={160} />
          </span>
          <br />
          <span className="font-semibold text-[#231a12]">
            mining, steel &amp; infrastructure leaders.
          </span>
        </h2>

        <div className="mx-auto my-6 h-px max-w-sm bg-[#ead9c9] [mask-image:linear-gradient(to_right,transparent,black,transparent)] sm:my-8" />
      </div>

      {/* Logo cloud spans a much wider track so more logos are visible */}
      <div className="mx-auto max-w-[1600px] px-6">
        <Reveal delayMs={160}>
          <div className="space-y-6 sm:space-y-10">
            <LogoCloud duration={70} gap={72} logos={customers} reverse />
            <LogoCloud duration={70} gap={72} logos={customers} reverse={false} />
          </div>
        </Reveal>

        <div className="mt-6 h-px bg-[#ead9c9] [mask-image:linear-gradient(to_right,transparent,black,transparent)] sm:mt-8" />
      </div>
    </section>
  );
}
