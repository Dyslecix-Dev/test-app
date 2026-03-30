import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/app/protected/profile/profile-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile",
};

// TODO: replace this demo page with your app's actual profile page
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // NOTE: the protected layout already calls createOrGetUser(), so the row is guaranteed to exist
  const user = await db.query.users.findFirst({
    where: eq(users.id, data.claims.sub as string),
  });

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <h2 className="text-2xl font-bold">Profile</h2>
      <ProfileForm defaultName={user?.name ?? ""} />
    </div>
  );
}
