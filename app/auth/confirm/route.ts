import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // TODO: update the default redirect ("/") to your app's main authenticated route
  const next = searchParams.get("next") ?? "/";
  // NOTE: prevent open-redirect attacks — only allow local paths, not protocol-relative URLs
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // NOTE: redirect user to specified redirect URL or root of app
      redirect(safeNext);
    } else {
      // NOTE: redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${encodeURIComponent(error?.message ?? "Verification failed")}`);
    }
  }

  // NOTE: redirect the user to an error page with some instructions
  redirect(`/auth/error?error=${encodeURIComponent("No token hash or type")}`);
}
