"use client";
import { motion } from "framer-motion";
import { stats } from "@/lib/mock-data";

export function StatsSection() {
  return (
    <section className="bg-brand-brown py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <p className="font-serif text-4xl md:text-5xl font-bold text-brand-orange mb-2">{stat.value}</p>
            <p className="font-sans text-sm text-brand-cream/70 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
