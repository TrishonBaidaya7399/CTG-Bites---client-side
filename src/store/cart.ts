import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number; // percentage, from backend response
  couponDiscountAmount: number; // absolute amount, from backend response (source of truth)

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;

  // Derived
  subtotal: () => number;
  discountAmount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: "",
      couponDiscount: 0,
      couponDiscountAmount: 0,

      addItem(item) {
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem(id) {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      },

      updateQty(id, qty) {
        if (qty < 1) {
          get().removeItem(id);
          return;
        }
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        }));
      },

      clearCart() {
        set({ items: [], couponCode: "", couponDiscount: 0, couponDiscountAmount: 0 });
      },

      async applyCoupon(code) {
        const upper = code.trim().toUpperCase();
        const subtotal = get().subtotal();

        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: upper, subtotal }),
          });
          const data = await res.json();

          if (!res.ok || !data.ok) {
            return { ok: false, message: data?.message ?? "Invalid coupon code." };
          }

          set({
            couponCode: upper,
            couponDiscount: data.discountPercent ?? 0,
            couponDiscountAmount: data.discountAmount ?? 0,
          });
          return { ok: true, message: `${data.discountPercent}% discount applied!` };
        } catch {
          return { ok: false, message: "Could not validate coupon. Try again." };
        }
      },

      removeCoupon() {
        set({ couponCode: "", couponDiscount: 0, couponDiscountAmount: 0 });
      },

      subtotal() {
        return get().items.reduce((s, i) => s + i.price * i.quantity, 0);
      },

      discountAmount() {
        return get().couponDiscountAmount;
      },

      total() {
        return get().subtotal() - get().discountAmount();
      },

      itemCount() {
        return get().items.reduce((s, i) => s + i.quantity, 0);
      },
    }),
    { name: "ctg-cart" }
  )
);
