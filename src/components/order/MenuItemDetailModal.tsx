"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { MenuItemDetailView, type MenuItemDetail, type AppetizerOption } from "@/components/menu/MenuItemDetailView";

interface RawMenuItem {
  _id?: string;
  id?: string;
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
  appetizers?: RawAppetizer[];
}

interface RawAppetizer {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

interface MenuItemDetailModalProps {
  menuItemId: string;
  onClose: () => void;
  onAddBundle: (item: MenuItemDetail, selected: AppetizerOption[]) => void;
}

/** Fetches the full detail payload (ingredients, description, linked appetizers) for a
 *  menu item clicked from the order-taking grid, and shows it as a centered modal built
 *  on the same MenuItemDetailView used by the public /menu/[id] page. "Add to Cart" here
 *  writes into the host order client's own local bundle state instead of useCartStore. */
export function MenuItemDetailModal({ menuItemId, onClose, onAddBundle }: MenuItemDetailModalProps) {
  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [appetizers, setAppetizers] = useState<AppetizerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/menu/${encodeURIComponent(menuItemId)}`);
        const data = await res.json();
        if (cancelled) return;
        const raw: RawMenuItem | null = data.item ?? data.data ?? null;
        if (!res.ok || !raw) {
          setError("Could not load this item.");
          return;
        }
        setItem({
          id: (raw._id ?? raw.id) as string,
          name: raw.name,
          category: raw.category,
          price: raw.price,
          rating: raw.rating,
          reviews: raw.reviews,
          badge: raw.badge,
          description: raw.description,
          image: raw.image,
          isVeg: raw.isVeg,
          isSpicy: raw.isSpicy,
          ingredients: raw.ingredients,
        });
        setAppetizers(
          (raw.appetizers ?? []).map((a) => ({
            id: (a._id ?? a.id) as string,
            name: a.name,
            price: a.price,
            image: a.image,
            description: a.description,
          }))
        );
      } catch {
        if (!cancelled) setError("Network error — could not load this item.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [menuItemId]);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-brand-cream rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-white rounded-full p-2 shadow-md text-brand-brown-mid hover:text-red-500 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-8">
          {loading ? (
            <p className="font-sans text-sm text-brand-brown-mid text-center py-24">Loading…</p>
          ) : error || !item ? (
            <p className="font-sans text-sm text-red-500 text-center py-24">{error || "Item not found."}</p>
          ) : (
            <MenuItemDetailView
              item={item}
              appetizers={appetizers}
              onAddBundle={(selected) => onAddBundle(item, selected)}
              addLabel="Add to Order"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
