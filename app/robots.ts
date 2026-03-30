import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // TODO: update the disallow rules to match your app's private routes
        disallow: ["/protected/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
