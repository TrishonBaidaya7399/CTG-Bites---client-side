import { notFound } from "next/navigation";
import Image from "next/image";
import { recipes } from "@/lib/mock-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { recipeSchema, breadcrumbSchema } from "@/lib/structured-data";
import { IngredientsGrid } from "@/components/recipe/IngredientsGrid";
import { StepsTimeline } from "@/components/recipe/StepsTimeline";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) return { title: "Recipe Not Found" };

  return {
    title: `${recipe.title} Recipe — Authentic Chittagong ${recipe.category}`,
    description: `Learn how to cook authentic ${recipe.title} at home. ${recipe.excerpt} Ready in ${recipe.time}, serves ${recipe.servings}. A classic Chittagong recipe from CTG Bites.`,
    keywords: [
      `${recipe.title} recipe`,
      `how to cook ${recipe.title}`,
      `authentic ${recipe.title}`,
      `Chittagong ${recipe.category} recipe`,
      `Bengali ${recipe.category} recipe`,
      `traditional ${recipe.title}`,
      `${recipe.title} ingredients`,
      `${recipe.title} step by step`,
      `Bangladeshi ${recipe.category} dish`,
      "authentic Chittagong recipe",
      "Bengali cooking tutorial",
      "CTG Bites recipe",
      "traditional Bengali cuisine",
      "Chittagong food recipe",
      `${recipe.difficulty.toLowerCase()} Bengali recipe`,
    ],
    alternates: { canonical: `https://ctgbites.com/recipes/${recipe.slug}` },
    openGraph: {
      type: "article",
      url: `https://ctgbites.com/recipes/${recipe.slug}`,
      title: `${recipe.title} — Authentic Chittagong Recipe | CTG Bites`,
      description: recipe.excerpt,
      images: [{ url: recipe.image, width: 1200, height: 630, alt: recipe.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${recipe.title} Recipe | CTG Bites`,
      description: recipe.excerpt,
      images: [recipe.image],
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) notFound();

  return (
    <article className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <JsonLd data={recipeSchema(recipe)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home",    url: "https://ctgbites.com" },
        { name: "Recipes", url: "https://ctgbites.com/recipes" },
        { name: recipe.title, url: `https://ctgbites.com/recipes/${recipe.slug}` },
      ])} />
      <span className="font-sans text-xs font-semibold uppercase tracking-widest text-brand-orange mb-4 block">
        {recipe.category}
      </span>
      <h1 className="font-serif text-5xl font-bold text-brand-brown mb-6">{recipe.title}</h1>
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-10">
        <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
      </div>
      <p className="font-sans text-brand-brown-mid text-lg mb-10 leading-relaxed">{recipe.excerpt}</p>

      <div className="mb-12">
        <IngredientsGrid ingredients={recipe.ingredients} />
      </div>
      <div className="mb-12">
        <StepsTimeline steps={recipe.steps} />
      </div>
    </article>
  );
}
