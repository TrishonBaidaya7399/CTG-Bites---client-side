"use client";

import { motion } from "framer-motion";

interface IngredientsGridProps {
  ingredients: string[];
}

export function IngredientsGrid({ ingredients }: IngredientsGridProps) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-brand-brown mb-6">Ingredients</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ingredients.map((ing, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="bg-brand-warm-gray rounded-xl px-4 py-3 flex items-start gap-2 border border-brand-cream"
          >
            <span className="text-brand-orange text-base leading-none mt-0.5 shrink-0">•</span>
            <span className="font-sans text-sm text-brand-brown-mid leading-snug">{ing}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
