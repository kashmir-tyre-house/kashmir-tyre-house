"use client";

import {
  Bookmark,
  Boxes,
  Info,
  LayoutGrid,
  Mail,
  Scale,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { FeatureName } from "@kth/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useFeatureFlags } from "../lib/features";
import {
  CommandPalette,
  type CommandItem,
} from "./ui/be-ui-command-palette";

// Each entry belongs to a feature module so the palette never offers a
// destination that has been switched off.
type GatedCommandItem = CommandItem & { feature?: FeatureName };

export function HeroCommandPalette() {
  const router = useRouter();
  const flags = useFeatureFlags();
  const [open, setOpen] = useState(false);

  // Smooth-scroll to a homepage section if present, else navigate to it.
  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  const items: GatedCommandItem[] = [
    {
      id: "all-products",
      feature: "products",
      label: "Browse all products",
      group: "Explore",
      icon: LayoutGrid,
      keywords: ["inventory", "catalogue", "tyres", "shop"],
      onSelect: () => router.push("/products"),
    },
    {
      id: "featured",
      feature: "products",
      label: "Featured products",
      group: "Explore",
      icon: Sparkles,
      keywords: ["popular", "highlights", "top"],
      onSelect: () => goToSection("tyres"),
    },
    {
      id: "brands",
      feature: "brands",
      label: "Trusted brands",
      group: "Explore",
      icon: Boxes,
      keywords: ["michelin", "maxam", "bridgestone", "partners"],
      onSelect: () => goToSection("brand"),
    },
    {
      id: "services",
      feature: "services",
      label: "Our services",
      group: "Explore",
      icon: Wrench,
      keywords: ["support", "fitting", "advisory"],
      onSelect: () => goToSection("services"),
    },
    {
      id: "about",
      feature: "about",
      label: "About Kashmir Tyre House",
      group: "Company",
      icon: Info,
      keywords: ["company", "story", "who we are"],
      onSelect: () => goToSection("about"),
    },
    {
      id: "bookmarks",
      feature: "bookmarks",
      label: "Saved products",
      group: "Your shortlist",
      icon: Bookmark,
      keywords: ["bookmarks", "wishlist", "favourites"],
      onSelect: () => router.push("/bookmarks"),
    },
    {
      id: "compare",
      feature: "compare",
      label: "Compare products",
      group: "Your shortlist",
      icon: Scale,
      keywords: ["versus", "side by side", "specs"],
      onSelect: () => router.push("/compare"),
    },
    {
      id: "enquiry",
      feature: "enquiries",
      label: "Send an enquiry",
      group: "Get in touch",
      icon: Mail,
      keywords: ["contact", "quote", "request"],
      onSelect: () => router.push("/contact"),
    },
  ];

  const enabledItems = items.filter(
    (item) => !item.feature || flags[item.feature]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="group inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/15 bg-white/5 px-3.5 text-[13px] font-medium text-white/75 backdrop-blur-sm transition-colors duration-300 hover:border-white/35 hover:bg-white/10 hover:text-white sm:h-11 sm:px-4"
      >
        <Search aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
        <span>Quick search</span>
        <kbd className="ml-1 hidden items-center gap-0.5 rounded border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/60 sm:inline-flex">
          ⌘ + K
        </kbd>
      </button>

      <CommandPalette
        items={enabledItems}
        open={open}
        onOpenChange={setOpen}
        shortcut="k"
        placeholder="Search products, brands, sections…"
        emptyMessage="Nothing matches — try another term."
      />
    </>
  );
}
