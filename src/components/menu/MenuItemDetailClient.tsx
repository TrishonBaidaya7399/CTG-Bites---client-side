"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, Flame, Leaf, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { AppetizerCompareSlider } from "@/components/menu/AppetizerCompareSlider";

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

export function MenuItemDetailClient({ item, appetizers }: { item: MenuItemDetail; appetizers: AppetizerOption[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedAppetizer, setSelectedAppetizer] = useState<AppetizerOption | null>(null);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    if (selectedAppetizer) {
      addItem({ id: selectedAppetizer.id, name: selectedAppetizer.name, price: selectedAppetizer.price, image: selectedAppetizer.image });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left column — image + appetizer row */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg bg-brand-warm-gray">
            {selectedAppetizer ? (
              <AppetizerCompareSlider
                mainImage={item.image}
                mainAlt={item.name}
                appetizerImage={selectedAppetizer.image}
                appetizerAlt={selectedAppetizer.name}
              />
            ) : (
              <Image src={item.image} alt={item.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
            )}
            <div className="absolute top-4 right-4 flex gap-1.5 z-10">
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
            {item.badge && !selectedAppetizer && (
              <span className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                {item.badge}
              </span>
            )}
          </div>

          {/* Appetizer row */}
          {appetizers.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                Pair with an appetizer
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {appetizers.map((a) => {
                  const isSelected = selectedAppetizer?.id === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAppetizer(isSelected ? null : a)}
                      className={cn(
                        "shrink-0 w-24 rounded-2xl overflow-hidden border-2 transition-colors text-left",
                        isSelected ? "border-brand-orange shadow-md" : "border-transparent hover:border-brand-orange/40"
                      )}
                    >
                      <div className="relative w-24 h-20 bg-brand-warm-gray">
                        <Image src={a.image} alt={a.name} fill sizes="96px" className="object-cover" />
                      </div>
                      <div className="px-1.5 py-1.5 bg-white">
                        <p className="font-sans text-xs font-semibold text-brand-brown truncate">{a.name}</p>
                        <p className="font-sans text-xs text-brand-orange font-bold">৳{a.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedAppetizer && (
                <p className="font-sans text-xs text-brand-brown-mid mt-2">
                  Drag the handle on the photo to compare <strong className="text-brand-brown">{item.name}</strong> with{" "}
                  <strong className="text-brand-brown">{selectedAppetizer.name}</strong>.
                </p>
              )}
            </div>
          )}
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

          {/* Selected appetizer recap */}
          {selectedAppetizer && (
            <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-brand-warm-gray">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-brand-warm-gray">
                <Image src={selectedAppetizer.image} alt={selectedAppetizer.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-semibold text-brand-brown truncate">{selectedAppetizer.name}</p>
                <p className="font-sans text-xs text-brand-brown-mid">Added as a side · ৳{selectedAppetizer.price}</p>
              </div>
            </div>
          )}

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
                  {selectedAppetizer ? "Add Dish + Appetizer to Cart" : "Add to Cart"}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
