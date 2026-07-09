import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";
import { RecipesSection } from "@/components/sections/RecipesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { restaurantSchema, websiteSchema } from "@/lib/structured-data";
import { apiUrl } from "@/lib/api";
import type { Metadata } from "next";

async function getRecipes() {
  const res = await fetch(apiUrl("/api/recipes"), { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const body = await res.json();
  return body.recipes ?? [];
}

export const metadata: Metadata = {
  title: "CTG Bites | Authentic Chittagong Cuisine — Mezzban, Kala Bhuna & More",
  description:
    "CTG Bites is Chittagong's finest restaurant for authentic Bengali cuisine. Taste slow-cooked Kala Bhuna, legendary Mezzban feasts, Shutki Bhorta, Ilish Paturi, and Mishti Doi. Order online or visit us at GEC Circle, Nasirabad, Chittagong.",
  keywords: [
    "CTG Bites",
    "Chittagong restaurant",
    "Chattogram restaurant",
    "authentic Bengali cuisine",
    "best restaurant in Chittagong",
    "Mezzban Chittagong",
    "Kala Bhuna restaurant",
    "Bangladeshi food delivery",
    "Bengali food near me",
    "order food Chittagong",
    "CTG food delivery",
    "authentic Bangladeshi cuisine",
    "best Bengali food Chittagong",
    "Mezbani restaurant",
    "Ilish Paturi",
    "Shutki Bhorta",
    "Bengali beef bhuna",
    "Mishti Doi Chittagong",
    "Borhani drink",
    "restaurant GEC Circle Chittagong",
    "Nasirabad restaurant",
    "traditional Chittagong food",
    "Bengali feast restaurant",
    "food delivery Chattogram",
    "slow-cooked Bengali dishes",
  ],
  alternates: {
    canonical: "https://ctgbites.com",
  },
  openGraph: {
    type: "website",
    url: "https://ctgbites.com",
    title: "CTG Bites | Authentic Chittagong Cuisine",
    description:
      "Slow-cooked Kala Bhuna, legendary Mezzban feasts, Shutki Bhorta & more. The real taste of Chittagong.",
    siteName: "CTG Bites",
    images: [{ url: "https://ctgbites.com/og-image.jpg", width: 1200, height: 630, alt: "CTG Bites Restaurant" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CTG Bites | Authentic Chittagong Cuisine",
    description: "Slow-cooked Kala Bhuna, legendary Mezzban feasts & more. The real taste of Chittagong.",
    images: ["https://ctgbites.com/og-image.jpg"],
  },
};

export const revalidate = 60;

export default async function HomePage() {
  const recipes = await getRecipes();

  return (
    <>
      <JsonLd data={restaurantSchema()} />
      <JsonLd data={websiteSchema()} />
      <HeroSection />
      <StatsSection />
      <FeaturedMenu />
      <RecipesSection recipes={recipes} />
      <TestimonialsSection />
    </>
  );
}
