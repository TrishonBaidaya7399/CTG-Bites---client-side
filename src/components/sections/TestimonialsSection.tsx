"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading
        eyebrow="Testimonials"
        title="What people say."
        subtitle="From Chittagonians and food lovers who know what real flavour means."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex mb-3">
              {[...Array(t.rating)].map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="font-sans text-sm text-brand-brown-mid leading-relaxed mb-5">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-warm-gray overflow-hidden relative flex-shrink-0">
                <Image src={t.avatar} alt={t.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-brand-brown">{t.name}</p>
                <p className="font-sans text-xs text-brand-brown-mid">{t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
