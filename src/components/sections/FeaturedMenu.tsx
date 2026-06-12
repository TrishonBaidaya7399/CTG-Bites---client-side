"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MenuCard } from "@/components/ui/MenuCard";
import { menuCategories, menuItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function FeaturedMenu() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? menuItems : menuItems.filter((i) => i.category === active);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading
        eyebrow="Our Menu"
        title="Every bite, a small joy."
        subtitle="Slow-cooked, spice-forward, unapologetically Chittagong."
      />

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap justify-center mb-12">
        {menuCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "px-5 py-2 rounded-full font-sans text-sm font-medium transition-all",
              active === cat
                ? "bg-brand-orange text-white shadow-md"
                : "bg-white text-brand-brown-mid hover:bg-brand-orange/10 hover:text-brand-orange border border-brand-warm-gray"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item, i) => (
          <MenuCard key={item.id} item={item} index={i} />
        ))}
      </motion.div>
    </section>
  );
}
