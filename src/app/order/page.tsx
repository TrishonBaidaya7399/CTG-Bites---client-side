import type { Metadata } from "next";
import { OnlineOrderClient } from "@/components/order/OnlineOrderClient";

export const metadata: Metadata = {
  title: "Order Online — Authentic Chittagong Food Delivery",
  description: "Order authentic Chittagong cuisine online from CTG Bites. Fresh delivery across Chittagong in 30 minutes.",
  alternates: { canonical: "https://ctgbites.com/order" },
};
export const dynamic = "force-dynamic";

export default function OrderPage() {
  return <OnlineOrderClient />;
}
