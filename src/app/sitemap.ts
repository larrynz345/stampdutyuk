import type { MetadataRoute } from "next";
import { SEO_PRICES, UK_CITIES } from "@/lib/seo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://stampdutyuk.vercel.app";

  const pricePages = SEO_PRICES.map((price) => ({
    url: `${base}/stamp-duty-on-${price}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const cityPages = UK_CITIES.map((city) => ({
    url: `${base}/stamp-duty-in-${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...cityPages,
    ...pricePages,
  ];
}
