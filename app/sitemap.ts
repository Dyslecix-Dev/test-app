import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

// TODO: add your app's public routes here — dynamic routes can be fetched from the database
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
