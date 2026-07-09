"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, Flame, Leaf, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppetizerOverlayCarousel } from "@/components/menu/AppetizerOverlayCarousel";
import { AppetizerSelectionTable } from "@/components/menu/AppetizerSelectionTable";

export interface MenuItemDetail {
  id: string;
  name: string;
  category: string;
  price: number;
  rating?: number;
  reviews?: number;
  badge?: string | null;
  description: string;
  image: string;
  isVeg?: boolean;
  isSpicy?: boolean;
  ingredients?: string[];
}

export interface AppetizerOption {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export interface MenuItemDetailViewProps {
  item: MenuItemDetail;
  appetizers: AppetizerOption[];
  onAddBundle: (selected: AppetizerOption[]) => void;
  addLabel?: string;
  addedFeedbackMs?: number;
}

export function MenuItemDetailView({
  item,
  appetizers,
  onAddBundle,
  addLabel,
  addedFeedbackMs = 1600,
}: MenuItemDetailViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  function toggleAppetizer(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddToCart() {
    const selected = appetizers.filter((a) => selectedIds.has(a.id));
    onAddBundle(selected);
    setAdded(true);
    setTimeout(() => setAdded(false), addedFeedbackMs);
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Left column — main image + overlay carousel */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg bg-brand-warm-gray">
          <Image src={item.image} alt={item.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />

          <div className="absolute top-4 right-4 flex gap-1.5 z-20">
            {item.isVeg && (
              <span className="bg-brand-green-herb text-white rounded-full p-1.5 shadow">
                <Leaf className="w-3.5 h-3.5" />
              </span>
            )}
            {item.isSpicy && (
              <span className="bg-red-500 text-white rounded-full p-1.5 shadow">
                <Flame className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          {item.badge && (
            <span className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow z-20">
              {item.badge}
            </span>
          )}

          <AppetizerOverlayCarousel appetizers={appetizers} selectedIds={selectedIds} onToggle={toggleAppetizer} />
        </div>
      </div>

      {/* Right column — item info */}
      <div className="space-y-5">
        <div>
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-brand-orange">{item.category}</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-brown mt-1 leading-tight">{item.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          {typeof item.rating === "number" && (
            <div className="flex items-center gap-1 text-sm text-brand-brown-mid">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-brand-brown">{item.rating}</span>
              <span>({item.reviews ?? 0} reviews)</span>
            </div>
          )}
          <span className="font-serif font-bold text-brand-orange text-2xl">৳{item.price}</span>
          <span
            className={cn(
              "font-sans text-xs font-semibold px-2.5 py-1 rounded-full border",
              item.isVeg
                ? "bg-brand-green-herb/10 text-brand-green-herb border-brand-green-herb/30"
                : "bg-red-50 text-red-500 border-red-200"
            )}
          >
            {item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
          </span>
        </div>

        <p className="font-sans text-brand-brown-mid leading-relaxed">{item.description}</p>

        {item.ingredients && item.ingredients.length > 0 && (
          <div>
            <p className="font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">Ingredients</p>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ing) => (
                <span key={ing} className="font-sans text-xs bg-white border border-brand-warm-gray rounded-full px-3 py-1 text-brand-brown">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        <AppetizerSelectionTable appetizers={appetizers} selectedIds={selectedIds} onToggle={toggleAppetizer} />

        <Button
          size="lg"
          onClick={handleAddToCart}
          className={cn(
            "w-full rounded-full py-6 font-semibold shadow-lg transition-colors flex items-center justify-center gap-2",
            added ? "bg-brand-green-herb hover:bg-brand-green-herb text-white" : "bg-brand-orange hover:bg-brand-orange-light text-white"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Added to Cart
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                {addLabel ?? (selectedCount > 0 ? `Add Dish + ${selectedCount} Appetizer${selectedCount > 1 ? "s" : ""}` : "Add to Cart")}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}
