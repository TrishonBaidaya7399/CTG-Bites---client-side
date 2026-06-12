/** JSON-LD structured data builders for CTG Bites */

const BASE_URL = "https://ctgbites.com";

export function restaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${BASE_URL}/#restaurant`,
    name: "CTG Bites",
    alternateName: ["CTG Bites Restaurant", "Chittagong Bites"],
    description:
      "Authentic Chittagong cuisine restaurant serving Mezzban, Kala Bhuna, Shutki Bhorta, Ilish Paturi, and traditional Bengali dishes. Order online or dine in.",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    image: `${BASE_URL}/og-image.jpg`,
    telephone: "+880-1800-000000",
    email: "hello@ctgbites.com",
    foundingDate: "2015",
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash, Credit Card, Mobile Banking (bKash, Nagad)",
    priceRange: "৳৳",
    servesCuisine: [
      "Bangladeshi",
      "Bengali",
      "Chittagong Cuisine",
      "South Asian",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "GEC Circle, Nasirabad",
      addressLocality: "Chittagong",
      addressRegion: "Chittagong Division",
      postalCode: "4000",
      addressCountry: "BD",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 22.3569,
      longitude: 91.7832,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "11:00",
        closes: "22:00",
      },
    ],
    hasMenu: `${BASE_URL}/menu`,
    acceptsReservations: true,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "18000",
      bestRating: "5",
    },
    sameAs: [
      "https://www.facebook.com/ctgbites",
      "https://www.instagram.com/ctgbites",
    ],
  };
}

export function menuItemSchema(item: {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    "@id": `${BASE_URL}/menu#item-${item.id}`,
    name: item.name,
    description: item.description,
    image: item.image.startsWith("http") ? item.image : `${BASE_URL}${item.image}`,
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock",
    },
    suitableForDiet: "https://schema.org/HalalDiet",
    inMenuSection: {
      "@type": "MenuSection",
      name: item.category,
    },
  };
}

export function recipeSchema(recipe: {
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  time: string;
  difficulty: string;
  servings: number;
  category: string;
  ingredients: string[];
  steps: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt,
    image: recipe.image.startsWith("http") ? recipe.image : `${BASE_URL}${recipe.image}`,
    author: {
      "@type": "Organization",
      name: "CTG Bites",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "CTG Bites",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/images/logo.png` },
    },
    datePublished: "2024-01-01",
    recipeCategory: recipe.category,
    recipeCuisine: "Bangladeshi",
    recipeYield: `${recipe.servings} servings`,
    totalTime: `PT${recipe.time.replace(" ", "").toUpperCase()}`,
    difficulty: recipe.difficulty,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
    url: `${BASE_URL}/recipes/${recipe.slug}`,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "CTG Bites",
    url: BASE_URL,
    description: "Authentic Chittagong cuisine — Mezzban, Kala Bhuna, Bhorta & more.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/menu?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };
}
