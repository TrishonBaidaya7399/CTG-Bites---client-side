import { Suspense } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full Menu — Mezzban, Kala Bhuna, Bhorta, Ilish & More",
  description:
    "Explore CTG Bites' full menu of authentic Chittagong dishes — Mezzban Beef Bhuna, Kala Bhuna, Shutki Bhorta, Aloo Bhorta, Ilish Paturi, Borhani, and Mishti Doi. Filter by category and order online.",
  keywords: [
    "CTG Bites menu",
    "Chittagong restaurant menu",
    "Mezzban beef bhuna menu",
    "Kala Bhuna menu Chittagong",
    "Shutki Bhorta",
    "Bengali food menu online",
    "Ilish Paturi restaurant",
    "Borhani Chittagong",
    "Mishti Doi restaurant",
    "Aloo Bhorta",
    "Bengali beef curry menu",
    "Mezbani dal",
    "authentic Bangladeshi dishes",
    "Bengali vegetarian food menu",
    "spicy Bengali dishes",
    "Chittagong fish curry",
    "traditional Bengali lunch menu",
    "Bengali dinner menu Chittagong",
    "best Bengali curry menu",
    "halal Bengali restaurant menu",
  ],
  alternates: { canonical: "https://ctgbites.com/menu" },
  openGraph: {
    type: "website",
    url: "https://ctgbites.com/menu",
    title: "CTG Bites Menu — Authentic Chittagong Dishes",
    description: "Mezzban, Kala Bhuna, Bhorta, Ilish, Borhani & more. Filter by category and order now.",
    images: [{ url: "https://ctgbites.com/og-menu.jpg", width: 1200, height: 630, alt: "CTG Bites Menu" }],
  },
};
export const revalidate = 120;

export default function MenuPage() {
  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <SectionHeading
          eyebrow="Full Menu"
          title="Something for every craving."
          subtitle="From Mezzban feasts to street-style bhorta — explore everything CTG Bites has to offer."
        />
      </div>
      <Suspense fallback={<div className="text-center py-24 font-sans text-brand-brown-mid">Loading menu…</div>}>
        <FeaturedMenu />
      </Suspense>
    </div>
  );
}
