"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";
import type { Review } from "@/types/review";

interface ApiMenuItem {
  id: string;
  name: string;
  image: string;
}

interface AddManualReviewModalProps {
  onClose: () => void;
  onCreated: (review: Review) => void;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = (hover || value) > i;
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i + 1)}
            className="p-0.5"
            aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
          >
            <Star className={cn("w-6 h-6 transition-colors", filled ? "fill-amber-400 text-amber-400" : "text-brand-warm-gray")} />
          </button>
        );
      })}
    </div>
  );
}

export function AddManualReviewModal({ onClose, onCreated }: AddManualReviewModalProps) {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const [menuItems, setMenuItems] = useState<ApiMenuItem[]>([]);
  const [menuItemId, setMenuItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAvatar, setCustomerAvatar] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sourceLabel, setSourceLabel] = useState("Google Reviews");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adminAccessToken) return;
    async function load() {
      const res = await fetch("/api/menu", { headers: { Authorization: `Bearer ${adminAccessToken}` }, cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        const items: ApiMenuItem[] = (data.data ?? []).map((raw: Record<string, unknown>) => ({
          id: (raw._id ?? raw.id) as string,
          name: raw.name as string,
          image: raw.image as string,
        }));
        setMenuItems(items);
      }
    }
    load();
  }, [adminAccessToken]);

  function pickMenuItem(id: string) {
    setMenuItemId(id);
    const item = menuItems.find((m) => m.id === id);
    if (item) {
      setItemName(item.name);
      setItemImage(item.image);
    }
  }

  async function handleSubmit() {
    if (!adminAccessToken) return;
    if (!itemName.trim() || !itemImage.trim() || !customerName.trim()) {
      setError("Dish name, dish image, and reviewer name are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/reviews/admin/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({
          menuItemId: menuItemId || undefined,
          itemName: itemName.trim(),
          itemImage: itemImage.trim(),
          customerName: customerName.trim(),
          customerAvatar: customerAvatar.trim() || undefined,
          rating,
          comment: comment.trim() || undefined,
          sourceLabel: sourceLabel.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not add review.");
        setSaving(false);
        return;
      }
      onCreated(data.review);
      onClose();
    } catch {
      setError("Network error — could not add review.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-brand-brown">Add a Review</h2>
          <button onClick={onClose} className="text-brand-brown-mid hover:text-red-500 transition-colors p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="font-sans text-xs text-brand-brown-mid -mt-2">
          For reviews left elsewhere (Google, Facebook, in person) that you want shown on the site.
        </p>

        <div>
          <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
            Dish <span className="normal-case font-normal opacity-60">(optional — pick to auto-fill name/image)</span>
          </label>
          <select
            value={menuItemId}
            onChange={(e) => pickMenuItem(e.target.value)}
            className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors cursor-pointer"
          >
            <option value="">Custom / not on menu</option>
            {menuItems.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
              Dish Name <span className="text-red-500">*</span>
            </label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
              Dish Image URL <span className="text-red-500">*</span>
            </label>
            <input
              value={itemImage}
              onChange={(e) => setItemImage(e.target.value)}
              placeholder="/images/menu/..."
              className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors"
            />
          </div>
        </div>

        {itemImage && (
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-warm-gray relative">
            <Image src={itemImage} alt={itemName || "Preview"} fill sizes="64px" className="object-cover" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
              Reviewer Name <span className="text-red-500">*</span>
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
              Reviewer Avatar URL <span className="normal-case font-normal opacity-60">(optional)</span>
            </label>
            <input
              value={customerAvatar}
              onChange={(e) => setCustomerAvatar(e.target.value)}
              placeholder="/images/avatars/..."
              className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
            Source <span className="normal-case font-normal opacity-60">(optional label, e.g. Google Reviews)</span>
          </label>
          <input
            value={sourceLabel}
            onChange={(e) => setSourceLabel(e.target.value)}
            className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        <div>
          <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div>
          <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
            Comment <span className="normal-case font-normal opacity-60">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="rounded-full text-sm" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-sm disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add Review"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
