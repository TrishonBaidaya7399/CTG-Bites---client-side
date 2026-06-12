"use client";

import { motion } from "framer-motion";

interface StepsTimelineProps {
  steps: string[];
}

export function StepsTimeline({ steps }: StepsTimelineProps) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-brand-brown mb-6">How to Cook</h2>
      <ol className="relative">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex gap-5 pb-8 last:pb-0"
            >
              {/* Vertical line */}
              {!isLast && (
                <motion.span
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                  className="absolute left-[19px] top-10 bottom-0 w-px bg-brand-warm-gray origin-top"
                />
              )}

              {/* Step number bubble */}
              <div className="shrink-0 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-brand-orange text-white font-serif font-bold text-base shadow-sm">
                {i + 1}
              </div>

              {/* Step text card */}
              <div className="flex-1 bg-white rounded-xl border border-brand-warm-gray px-4 py-3 shadow-sm">
                <p className="font-sans text-sm text-brand-brown-mid leading-relaxed">{step}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
