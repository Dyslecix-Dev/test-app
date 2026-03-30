import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // NOTE: only enable in production — avoids noise during local development
  enabled: process.env.NODE_ENV === "production",
  // NOTE: capture 100% of errors, sample 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,
  // NOTE: capture session replay for 1% of sessions, 100% on errors
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
});
