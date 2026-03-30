import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ActivityTracker } from "@/components/activity-tracker";
import { AuthButton } from "@/components/auth-button";
// TODO: remove DeployButton import — this is a boilerplate demo only
import { DeployButton } from "@/components/deploy-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { siteConfig } from "@/lib/config";
import { createOrGetUser } from "@/lib/db/ensure-user";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // NOTE: sync Supabase Auth user → Drizzle users table on every protected page load.
  // The first visit creates the row; subsequent visits are a cheap SELECT.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  await createOrGetUser({ id: data.claims.sub as string, email: data.claims.email as string });

  return (
    <div className="flex min-h-screen flex-col items-center">
      <ActivityTracker />
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav aria-label="Main navigation" className="border-b-foreground/10 flex h-16 w-full justify-center border-b">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={"/"}>{siteConfig.name}</Link>
              <Link href={"/protected/profile"} className="text-muted-foreground hover:text-foreground font-normal transition-colors">
                Profile
              </Link>
              {/* TODO: remove Users link — this is a pagination demo only */}
              <Link href={"/protected/users"} className="text-muted-foreground hover:text-foreground font-normal transition-colors">
                Users
              </Link>
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
        <div className="flex max-w-5xl flex-1 flex-col gap-20 p-5">{children}</div>
        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <ThemeSwitcher />
        </footer>
      </div>
    </div>
  );
}
