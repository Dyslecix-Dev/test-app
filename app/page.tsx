import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
// TODO: remove DeployButton and Hero imports — these are boilerplate demos only
import { DeployButton } from "@/components/deploy-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";

// TODO: update with your app's real name, URL, and description
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "My App",
  url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
  description: "My App description",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav aria-label="Main navigation" className="border-b-foreground/10 flex h-16 w-full justify-center border-b">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              {/* TODO: replace "My App" with your app name */}
              <Link href={"/"}>My App</Link>
              {/* TODO: remove <DeployButton /> — this is a boilerplate helper only */}
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>
        {/* TODO: remove <Hero /> and replace with your app's landing content */}
        <div className="flex max-w-5xl flex-1 flex-col gap-20 p-5">
          <Hero />
        </div>
        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <ThemeSwitcher />
        </footer>
      </div>
    </div>
  );
}
