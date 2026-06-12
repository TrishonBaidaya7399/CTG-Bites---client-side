"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

/** 3D tilt card — follows cursor on desktop.
 *  The glare gradient is derived unconditionally (no hook inside JSX conditional). */
export function AuthCard({ children, className }: AuthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 25 });

  // Glare position — always computed, never inside a conditional
  const glowX = useTransform(rawX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(rawY, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.07) 0%, transparent 60%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - left) / width - 0.5);
    rawY.set((e.clientY - top) / height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn("relative w-full max-w-md", className)}
    >
      {/* Glare overlay — always mounted, opacity driven by hovered state */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none z-10"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: glareBackground }}
      />

      {/* Card body */}
      <div
        className={cn(
          "relative rounded-3xl border border-white/10 overflow-hidden",
          "bg-white/5 backdrop-blur-2xl shadow-2xl shadow-black/40",
        )}
        style={{ transform: "translateZ(0px)" }}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-orange/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-brand-orange/8 to-transparent" />
        {children}
      </div>
    </motion.div>
  );
}
