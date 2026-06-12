import { RecipesSection } from "@/components/sections/RecipesSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bengali Recipes — Kala Bhuna, Mezbani Dal, Shutki Bhorta & More",
  description:
    "Learn to cook authentic Chittagong dishes at home. Step-by-step recipes for Kala Bhuna, Mezbani Dal, Shutki Bhorta, Ilish Paturi, and more — from CTG Bites' kitchen.",
  keywords: [
    "Bengali recipes",
    "Kala Bhuna recipe",
    "how to cook Kala Bhuna",
    "Mezbani Dal recipe",
    "Shutki Bhorta recipe",
    "Chittagong recipes",
    "authentic Bangladeshi recipes",
    "Bengali cooking at home",
    "Ilish recipe Bangladesh",
    "Shorshe Ilish recipe",
    "traditional Bengali dish recipe",
    "Mezzban feast recipe",
    "Bengali beef bhuna recipe",
    "easy Bengali recipes",
    "step by step Bengali cooking",
    "Bangladeshi home cooking",
    "Bengali fish curry recipe",
    "Bhorta recipe Bengali",
    "how to make Mezbani dal",
    "Chittagong style recipes",
    "restaurant recipe Chittagong",
    "spicy Bengali recipes",
    "Bengali cuisine tutorial",
    "authentic Chittagong cooking guide",
  ],
  alternates: { canonical: "https://ctgbites.com/recipes" },
  openGraph: {
    type: "website",
    url: "https://ctgbites.com/recipes",
    title: "Bengali Recipes — Cook Chittagong Dishes at Home | CTG Bites",
    description: "Step-by-step recipes for Kala Bhuna, Mezbani Dal, Shutki Bhorta & more from CTG Bites' kitchen.",
    images: [{ url: "https://ctgbites.com/og-recipes.jpg", width: 1200, height: 630, alt: "CTG Bites Recipes" }],
  },
};
export const revalidate = 300;

export default function RecipesPage() {
  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <SectionHeading
          eyebrow="Recipes"
          title="Master the craft."
          subtitle="Every recipe is tested in our kitchen. Walk through it step by step."
        />
      </div>
      <RecipesSection />
    </div>
  );
}
