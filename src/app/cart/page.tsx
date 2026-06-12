import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Cart & Checkout — CTG Bites",
  description: "Review your order, apply coupon codes, and place your Cash on Delivery order from CTG Bites.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
