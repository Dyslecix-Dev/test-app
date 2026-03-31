import { withSentryConfig } from "@sentry/nextjs";
import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";
import { z } from "zod/v4";

(() => {
  // NOTE: only validates env vars that are actually used in application code.
  // Many additional vars (SUPABASE_ANON_KEY, POSTGRES_HOST, POSTGRES_DATABASE, etc.) are auto-populated by the Vercel × Supabase integration but not consumed by this app.
  // They remain in .env.example for reference — see docs/environment.md for details.
  const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    POSTGRES_URL: z.url(),
    POSTGRES_URL_NON_POOLING: z.url(),
    NEXT_PUBLIC_APP_URL: z.url().optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    // NOTE: generate VAPID keys with: pnpm dlx web-push generate-vapid-keys
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
    VAPID_PRIVATE_KEY: z.string().min(1).optional(),
    VAPID_MAILTO: z.string().startsWith("mailto:").optional(),
  });

  if (!process.env.CI && (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production")) {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      console.error("\nInvalid or missing environment variables:\n");
      for (const [field, messages] of Object.entries(fieldErrors)) {
        console.error(`  ${field}: ${messages?.join(", ")}`);
      }
      console.error("\nSee docs/environment.md for setup instructions.\n");
      process.exit(1);
    }
  }
})();

const nextConfig: NextConfig = {
  experimental: {
    // NOTE: Next.js automatically checks the Origin header on Server Action requests and rejects cross-origin calls (CSRF protection). If your app is behind a reverse proxy on a different domain, add that domain here:
    // serverActions: { allowedOrigins: ["my-proxy.com"] },
  },
  async headers() {
    // NOTE: Content-Security-Policy directives — update these when adding new external resources.
    // WARNING: 'unsafe-inline' is required for Next.js inline scripts/styles and Tailwind.
    // If you remove Vercel Analytics, remove https://va.vercel-scripts.com from script-src.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""} https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.ingest.sentry.io`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "worker-src 'self'",
    ]
      .join("; ")
      .trim();

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  cacheComponents: true,
};

export default withSentryConfig(withSerwist(nextConfig), {
  // NOTE: suppresses source map upload logs during build
  silent: true,
  // NOTE: automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
