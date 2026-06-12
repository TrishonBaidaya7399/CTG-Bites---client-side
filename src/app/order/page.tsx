import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";

export const metadata: Metadata = {
  title: "Order Online — Authentic Chittagong Food Delivery",
  description:
    "Order authentic Chittagong cuisine online from CTG Bites. Get Mezzban Beef Bhuna, Kala Bhuna, Ilish Paturi, Shutki Bhorta, and more delivered fresh to your door in 30 minutes across Chittagong.",
  keywords: [
    "order Bengali food online",
    "order Chittagong food delivery",
    "CTG Bites order now",
    "Mezzban delivery Chittagong",
    "Kala Bhuna delivery",
    "food delivery GEC Circle Chittagong",
    "online order Bengali restaurant",
    "Chittagong food delivery app",
    "order authentic Bangladeshi food",
    "fast food delivery Chittagong",
    "Bengali cuisine home delivery",
    "order Ilish Paturi online",
    "Borhani delivery Chittagong",
    "Mishti Doi delivery",
    "halal food delivery Chittagong",
    "order traditional Bengali feast",
    "bulk food order Chittagong",
    "restaurant delivery Nasirabad",
    "Bengali takeaway Chittagong",
    "order Chittagong cuisine online",
  ],
  alternates: { canonical: "https://ctgbites.com/order" },
  openGraph: {
    type: "website",
    url: "https://ctgbites.com/order",
    title: "Order Online | CTG Bites — Chittagong Food Delivery",
    description: "Order Mezzban, Kala Bhuna, Ilish & more. Fresh delivery across Chittagong in 30 minutes.",
    images: [{ url: "https://ctgbites.com/og-order.jpg", width: 1200, height: 630, alt: "Order CTG Bites" }],
  },
};
export const dynamic = "force-dynamic";

export default function OrderPage() {
  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <SectionHeading
          eyebrow="Order Online"
          title="Fresh to your door."
          subtitle="Select your items and we'll have them ready in 30 minutes."
        />
      </div>
      <FeaturedMenu />
    </div>
  );
}
