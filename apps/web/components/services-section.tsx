import { Raleway, Karla } from "next/font/google";

const karla = Karla({
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

const services = [
  {
    number: "01",
    title: "Technical Tyre Advisory",
    description:
      "Our specialists assess your vehicle, route, load and operating conditions to recommend the optimal tyre size, load index, ply rating and tread pattern.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 14a8 8 0 1 1 16 0" />
        <path d="M12 14l4-4" />
        <path d="M8 18h8" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Fitting & Wheel Balancing",
    description:
      "Precision installation with computerised wheel balancing to extend tyre life and ensure a smooth ride.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="m14.7 6.3 3 3" />
        <path d="M12 8 4 16l4 4 8-8" />
        <path d="M17.6 3.6a4 4 0 0 0 2.8 6.8L16 14.8 9.2 8l4.4-4.4a4 4 0 0 0 4 0Z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "On-Site Service",
    description:
      "We come to you. Bulk fittings at your depot, emergency replacements on the road — minimising fleet downtime.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Tyre Inspection & Health Checks",
    description:
      "Regular wear, pressure and alignment checks to spot issues before they become breakdowns.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M9 5h6" />
        <path d="M9 3h6v4H9z" />
        <path d="M6 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" />
        <path d="m9 14 2 2 4-5" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Warranty Support",
    description:
      "Genuine products from authorised brands, with full manufacturer warranty handled in-house.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "06",
    title: "Fleet Account Management",
    description:
      "Dedicated account manager for fleet customers, with consolidated billing and proactive replacement scheduling.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.91.33 1.79.63 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.15a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.63.63A2 2 0 0 1 22 16.92Z" />
      </svg>
    ),
  },
];

export function ServicesSection() {
  return (
    <section
      aria-labelledby="services-heading"
      className="bg-[#f9eee4] px-4 py-14 sm:px-6 lg:px-8 lg:py-14"
      id="services"
    >
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2
          className={`${raleway.className} text-[30px] font-medium leading-tight tracking-[-0.03em] text-[#231a12] sm:text-[38px] lg:text-[44px]`}
          id="services-heading"
        >
          Our Services
        </h2>
      </div>

      <div className={`${karla.className} mx-auto grid max-w-330 gap-4 md:grid-cols-2 xl:grid-cols-3`}>
        {services.map((service) => (
            <article
              className="group relative flex min-h-60 items-start overflow-hidden rounded-[18px] border border-[#ead9c9]/70 bg-[linear-gradient(145deg,#ffffff_0%,#fff8f5_52%,#f3e4d6_100%)] px-7 py-7 shadow-[0_12px_40px_rgba(35,26,18,0.07)] transition-shadow duration-500 ease-in-out hover:shadow-[0_20px_56px_rgba(138,81,0,0.14)]"
              key={service.number}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(246,147,0,0.22),transparent_62%),radial-gradient(circle_at_86%_88%,rgba(138,81,0,0.09),transparent_62%)] opacity-100 transition-opacity duration-700 ease-in-out group-hover:opacity-0" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_88%,rgba(246,147,0,0.22),transparent_62%),radial-gradient(circle_at_14%_12%,rgba(138,81,0,0.09),transparent_62%)] opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(345deg,rgba(255,255,255,0.68),rgba(255,255,255,0)_52%)] opacity-100 transition-opacity duration-700 ease-in-out group-hover:opacity-0" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.68),rgba(255,255,255,0)_52%)] opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100" />

              <div className="relative">
                {/* Icon — radial glow spreads to 62% radius for a wider warm bloom */}
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/90 bg-[radial-gradient(circle_at_30%_25%,rgba(255,184,111,0.55),transparent_72%),linear-gradient(140deg,#fff8f5_0%,#ffffff_100%)] text-[#8a5100] shadow-[0_4px_14px_rgba(138,81,0,0.1)] transition-colors duration-300 ease-out group-hover:text-[#f69300]">
                  {service.icon}
                </div>

                <h3 className="mb-2.5 max-w-55 text-[18px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#16191d] sm:text-[20px]">
                  {service.title}
                </h3>

                <p className="text-[13px] font-medium leading-[1.55] tracking-[-0.015em] text-[#6f6258] sm:text-[14px]">
                  {service.description}
                </p>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
