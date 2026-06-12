"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FloatingImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  delay?: number;
  amplitude?: number;
  duration?: number;
}

export function FloatingImage({
  src,
  alt,
  width,
  height,
  className,
  delay = 0,
  amplitude = 15,
  duration = 5,
}: FloatingImageProps) {
  return (
    <motion.div
      className={cn("absolute pointer-events-none select-none", className)}
      animate={{ y: [0, -amplitude, 0], rotate: [0, 2, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}
    >
      <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" priority />
    </motion.div>
  );
}
