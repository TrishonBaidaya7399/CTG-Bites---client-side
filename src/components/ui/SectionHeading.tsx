"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  align = "center",
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={cn("mb-12", align === "center" ? "text-center" : "text-left", className)}
    >
      {eyebrow && (
        <span className="inline-block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-orange mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-(--font-italianno) text-6xl md:text-7xl lg:text-8xl text-brand-brown leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 font-(--font-courgette) text-brand-brown-mid text-xl md:text-2xl max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
