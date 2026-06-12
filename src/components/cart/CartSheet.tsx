"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const { items, removeItem, updateQty, subtotal, discountAmount, total,
          couponCode, couponDiscount, applyCoupon, removeCoupon } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    setCouponMsg({ ok: result.ok, text: result.message });
    if (result.ok) setCouponInput("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-brand-cream shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-warm-gray">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-orange" />
                <h2 className="font-serif text-xl font-bold text-brand-brown">Your Cart</h2>
                {items.length > 0 && (
                  <span className="bg-brand-orange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-brand-brown-mid hover:text-brand-brown transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="w-16 h-16 text-brand-warm-gray" />
                  <p className="font-serif text-xl text-brand-brown-mid">Your cart is empty</p>
                  <p className="font-sans text-sm text-brand-brown-mid">Add something delicious from the menu.</p>
                  <Link href="/menu" onClick={onClose}>
                    <Button className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full px-6 mt-2">
                      Browse Menu
                    </Button>
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                      className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-brand-warm-gray">
                        <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm font-bold text-brand-brown leading-tight truncate">{item.name}</p>
                        <p className="font-sans text-xs text-brand-brown-mid mt-0.5">৳{item.price} each</p>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-brand-warm-gray flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-sans text-sm font-semibold text-brand-brown w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-brand-warm-gray flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Price + delete */}
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <button onClick={() => removeItem(item.id)} className="text-brand-brown-mid hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <p className="font-serif font-bold text-brand-orange text-sm">৳{item.price * item.quantity}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — coupon + summary + checkout */}
            {items.length > 0 && (
              <div className="border-t border-brand-warm-gray px-5 pt-4 pb-28 md:pb-6 space-y-4 bg-white">
                {/* Coupon */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                    <Tag className="w-3.5 h-3.5" /> Coupon Code
                  </label>
                  {couponCode ? (
                    <div className="flex items-center justify-between bg-brand-green-herb/10 border border-brand-green-herb/30 rounded-xl px-3 py-2">
                      <span className="font-sans text-sm font-bold text-brand-green-herb">{couponCode} — {couponDiscount}% off</span>
                      <button onClick={() => { removeCoupon(); setCouponMsg(null); }} className="text-brand-brown-mid hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(null); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Enter code e.g. WELCOME15"
                        className="flex-1 font-sans text-sm bg-brand-warm-gray/50 border border-brand-warm-gray rounded-xl px-3 py-2 outline-none focus:border-brand-orange transition-colors placeholder:text-brand-brown-mid/40 uppercase"
                      />
                      <Button
                        size="sm"
                        onClick={handleApplyCoupon}
                        variant="outline"
                        className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white rounded-xl shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  {couponMsg && !couponCode && (
                    <p className={cn("text-xs mt-1.5 font-medium", couponMsg.ok ? "text-brand-green-herb" : "text-red-500")}>
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* Order summary */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-sans text-sm text-brand-brown-mid">
                    <span>Subtotal</span>
                    <span>৳{subtotal()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between font-sans text-sm text-brand-green-herb">
                      <span>Discount ({couponDiscount}%)</span>
                      <span>−৳{discountAmount()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-sans text-sm text-brand-brown-mid">
                    <span>Delivery</span>
                    <span className="text-brand-green-herb font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between font-serif font-bold text-brand-brown text-lg pt-2 border-t border-brand-warm-gray">
                    <span>Total</span>
                    <span className="text-brand-orange">৳{total()}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <Link href="/cart" onClick={onClose} className="block">
                  <Button className="w-full bg-brand-orange hover:bg-brand-orange-light text-white rounded-full py-6 font-semibold text-sm shadow-lg flex items-center justify-center gap-2">
                    Proceed to Checkout <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
