"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import { GripVertical } from "lucide-react";

interface AppetizerCompareSliderProps {
  mainImage: string;
  mainAlt: string;
  appetizerImage: string;
  appetizerAlt: string;
}

// Vertical drag handle that reveals the appetizer image over the main dish
// image, both stacked in the same frame. Position is a percentage (0-100) of
// frame width; the appetizer layer is clipped to the region right of the handle.
export function AppetizerCompareSlider({ mainImage, mainAlt, appetizerImage, appetizerAlt }: AppetizerCompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const x = useMotionValue(50); // percentage 0-100

  const clipPath = useTransform(x, (v) => `inset(0 0 0 ${v}%)`);
  const handleLeft = useTransform(x, (v) => `${v}%`);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    animate(x, Math.min(100, Math.max(0, pct)), { duration: 0 });
  }

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  }

  function handlePointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none touch-none cursor-ew-resize overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Base layer — main dish */}
      <Image src={mainImage} alt={mainAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />

      {/* Overlay layer — appetizer, clipped from the handle to the right edge */}
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <Image src={appetizerImage} alt={appetizerAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </motion.div>

      {/* Drag handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
        style={{ left: handleLeft, marginLeft: "-2px" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center">
          <GripVertical className="w-4 h-4 text-brand-brown" />
        </div>
      </motion.div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-sans font-semibold px-2.5 py-1 rounded-full pointer-events-none">
        {mainAlt}
      </span>
      <span className="absolute bottom-3 right-3 bg-brand-orange/90 text-white text-xs font-sans font-semibold px-2.5 py-1 rounded-full pointer-events-none">
        {appetizerAlt}
      </span>
    </div>
  );
}
