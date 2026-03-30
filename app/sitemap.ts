import type { MetadataRoute } from "next";

// TODO: add your app's public routes here — dynamic routes can be fetched from the database
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
