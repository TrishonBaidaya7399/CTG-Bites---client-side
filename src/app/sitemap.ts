import type { MetadataRoute } from "next";
import { apiUrl } from "@/lib/api";

const BASE_URL = "https://ctgbites.com";

async function getRecipes(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(apiUrl("/api/recipes"), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const body = await res.json();
    return body.recipes ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await getRecipes();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/recipes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/order`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${BASE_URL}/recipes/${recipe.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...recipePages];
}
