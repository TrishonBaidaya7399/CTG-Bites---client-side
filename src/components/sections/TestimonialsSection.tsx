"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="What people say."
          subtitle="From Chittagonians and food lovers who know what real flavour means."
        />

        {/* Mobile: horizontal scroll snap; Desktop: 4-col grid */}
        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible pb-2 md:pb-0">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow snap-start shrink-0 w-[78vw] sm:w-[55vw] md:w-auto"
            >
              <div className="flex mb-3">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-sans text-sm text-brand-brown-mid leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-warm-gray overflow-hidden relative shrink-0">
                  <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-brand-brown">{t.name}</p>
                  <p className="font-sans text-xs text-brand-brown-mid">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
