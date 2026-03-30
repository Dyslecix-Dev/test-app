// NOTE: Next.js 16 renamed middleware.ts to proxy.ts — this file runs on every matched request and refreshes the Supabase auth session. See docs/auth-patterns.md.
import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // NOTE: match all request paths except:
    // _next/static (static files)
    // _next/image (image optimization files)
    // favicon.ico (favicon file)
    // images - .svg, .png, .jpg, .jpeg, .gif, .webp
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
