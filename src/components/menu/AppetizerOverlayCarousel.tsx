"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppetizerOverlayItem {
  id: string;
  name: string;
  image: string;
}

interface AppetizerOverlayCarouselProps {
  appetizers: AppetizerOverlayItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

/** Auto-sliding strip of circular appetizer thumbnails overlaid along the bottom
 *  edge of the main dish image. Pauses on hover/touch; a persistent ring + check
 *  badge marks whichever appetizers are currently selected in the table below. */
export function AppetizerOverlayCarousel({ appetizers, selectedIds, onToggle }: AppetizerOverlayCarouselProps) {
  const [paused, setPaused] = useState(false);

  if (appetizers.length === 0) return null;

  // Looping less than 3 items reads as jittery rather than a smooth marquee — show static instead.
  const shouldLoop = appetizers.length > 2;
  const loopItems = shouldLoop ? [...appetizers, ...appetizers] : appetizers;
  const duration = appetizers.length * 3;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 overflow-hidden z-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <motion.div
        className={cn("absolute bottom-3 left-3 flex gap-3", !shouldLoop && "justify-center w-[calc(100%-1.5rem)]")}
        animate={shouldLoop ? { x: paused ? undefined : ["0%", "-50%"] } : undefined}
        transition={shouldLoop ? { duration, repeat: Infinity, ease: "linear" } : undefined}
      >
        {loopItems.map((a, i) => {
          const isSelected = selectedIds.has(a.id);
          return (
            <button
              key={`${a.id}-${i}`}
              type="button"
              onClick={() => onToggle(a.id)}
              className="relative shrink-0"
              aria-label={`${isSelected ? "Remove" : "Add"} ${a.name}`}
            >
              <div
                className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all",
                  isSelected ? "border-brand-orange ring-2 ring-brand-orange ring-offset-2" : "border-white/80"
                )}
              >
                <Image src={a.image} alt={a.name} width={64} height={64} className="w-full h-full object-cover" />
              </div>
              {isSelected && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white rounded-full p-0.5 shadow">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
