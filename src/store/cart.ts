import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export const COUPONS: Record<string, number> = {
  CTGBITES10: 10,
  WELCOME15:  15,
  FEAST20:    20,
  BHORTA5:    5,
  NEWUSER25:  25,
};

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number; // percentage

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
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
        set({ items: [], couponCode: "", couponDiscount: 0 });
      },

      applyCoupon(code) {
        const upper = code.trim().toUpperCase();
        const discount = COUPONS[upper];
        if (discount === undefined) {
          return { ok: false, message: "Invalid coupon code." };
        }
        set({ couponCode: upper, couponDiscount: discount });
        return { ok: true, message: `${discount}% discount applied!` };
      },

      removeCoupon() {
        set({ couponCode: "", couponDiscount: 0 });
      },

      subtotal() {
        return get().items.reduce((s, i) => s + i.price * i.quantity, 0);
      },

      discountAmount() {
        return Math.round((get().subtotal() * get().couponDiscount) / 100);
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
