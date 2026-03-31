export const siteConfig = {
  name: "TaskFlow",
  description: "A full-stack project and task management app built on Next.js, Supabase, and Drizzle ORM.",
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
} as const;
