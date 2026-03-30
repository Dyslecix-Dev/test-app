export const siteConfig = {
  name: "Todo App",
  description: "This is meant to test how using the boilerplate works",
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
} as const;
