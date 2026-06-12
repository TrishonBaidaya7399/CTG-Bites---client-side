import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/register", "/api/", "/cart", "/forgot-password"],
      },
    ],
    sitemap: "https://ctgbites.com/sitemap.xml",
    host: "https://ctgbites.com",
  };
}
