"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, X, CheckCircle2, Layers, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

interface ReviewModalProps {
  order: Order;
  onClose: () => void;
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

export function ReviewModal({ order, onClose }: ReviewModalProps) {
  const multiItem = order.items.length > 1;
  const [mode, setMode] = useState<"together" | "separate" | null>(multiItem ? null : "together");
  // Keyed by index into order.items, not menuItemId — items whose menu item was later
  // deleted all share an empty menuItemId, which would collide as an object key.
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function setRating(index: number, value: number) {
    setRatings((prev) => ({ ...prev, [index]: value }));
  }

  const allRated = order.items.every((_, index) => (ratings[index] ?? 0) > 0);

  async function handleSubmit() {
    if (!mode || !allRated) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.customerName,
          comment: comment.trim() || undefined,
          mode,
          items: order.items.map((_, index) => ({
            itemIndex: index,
            rating: ratings[index],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not submit your review. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
      setTimeout(onClose, 2400);
    } catch {
      setError("Network error — could not submit your review.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 bg-brand-green-herb/15 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-brand-green-herb" />
              </motion.div>
              <p className="font-serif text-xl font-bold text-brand-brown">Thanks for the review!</p>
              <p className="font-sans text-sm text-brand-brown-mid">We've sent a little thank-you to your inbox.</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-brand-brown">Rate your order</h2>
                <button onClick={onClose} className="text-brand-brown-mid hover:text-red-500 transition-colors p-1" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode picker — only shown for multi-item orders */}
              {multiItem && mode === null && (
                <div className="space-y-3">
                  <p className="font-sans text-sm text-brand-brown-mid">How would you like to review this order?</p>
                  <button
                    onClick={() => setMode("together")}
                    className="w-full flex items-center gap-3 rounded-2xl border-2 border-brand-warm-gray hover:border-brand-orange px-4 py-3.5 text-left transition-colors"
                  >
                    <Layers className="w-5 h-5 text-brand-orange shrink-0" />
                    <span>
                      <span className="block font-sans font-semibold text-sm text-brand-brown">Review all items together</span>
                      <span className="block font-sans text-xs text-brand-brown-mid">One comment, rate each dish</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setMode("separate")}
                    className="w-full flex items-center gap-3 rounded-2xl border-2 border-brand-warm-gray hover:border-brand-orange px-4 py-3.5 text-left transition-colors"
                  >
                    <ListChecks className="w-5 h-5 text-brand-orange shrink-0" />
                    <span>
                      <span className="block font-sans font-semibold text-sm text-brand-brown">Review each item separately</span>
                      <span className="block font-sans text-xs text-brand-brown-mid">Each dish appears as its own review</span>
                    </span>
                  </button>
                </div>
              )}

              {/* Rating form — shown once mode is chosen (or immediately for single-item orders) */}
              {mode !== null && (
                <>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {order.items.map((item, index) => (
                      <div key={`${item.menuItemId}-${index}`} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-brand-warm-gray relative">
                          <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-brand-brown truncate">{item.name}</p>
                          <StarPicker value={ratings[index] ?? 0} onChange={(v) => setRating(index, v)} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                      Your thoughts <span className="normal-case font-normal opacity-60">(optional)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us what you loved (or what we can improve)…"
                      rows={3}
                      className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors resize-none"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500">{error}</p>}

                  <div className="flex gap-2">
                    {multiItem && (
                      <Button onClick={() => setMode(null)} variant="outline" className="rounded-full text-sm" disabled={submitting}>
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={handleSubmit}
                      disabled={!allRated || submitting}
                      className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-sm disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Submit Review"}
                    </Button>
                  </div>
                </>
              )}

              <button
                onClick={onClose}
                className="w-full text-center font-sans text-xs text-brand-brown-mid hover:text-brand-brown transition-colors pt-1"
              >
                Maybe later
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
