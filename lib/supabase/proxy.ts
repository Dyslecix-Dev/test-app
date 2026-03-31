import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { createRateLimiter } from "@/lib/rate-limit";

// NOTE: override with AUTH_RATE_LIMIT (max requests) and AUTH_RATE_WINDOW_MS (window in ms)
const authLimiter = createRateLimiter({
  limit: Number(process.env.AUTH_RATE_LIMIT) || 10,
  windowMs: Number(process.env.AUTH_RATE_WINDOW_MS) || 60_000,
});

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // NOTE: rate-limit auth routes to prevent brute-force attacks
  if (request.nextUrl.pathname.startsWith("/auth")) {
    // NOTE: x-forwarded-for is trusted here because Vercel (and most reverse proxies) overwrite the first value with the real client IP. If you self-host behind a proxy that doesn't strip client-provided values, replace this with a trusted header (e.g. cf-connecting-ip, x-real-ip).
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await authLimiter.check(ip);
    if (!success) {
      return new NextResponse("Too many requests. Please try again later.", { status: 429 });
    }
  }

  // TODO: skip auth check if env vars are not configured yet (e.g. fresh clone before .env is set up).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return supabaseResponse;
  }

  // WARNING: with Fluid compute, don't put this client in a global environment variable. Always create a new one on each request.
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // WARNING: do not run code between createServerClient and supabase.auth.getClaims(). A simple mistake could make it very hard to debug issues with users being randomly logged out.

  // WARNING: if you remove getClaims() and you use server-side rendering with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // TODO: update this condition to match your app's protected routes (e.g., add public marketing pages or restrict additional paths)
  if (request.nextUrl.pathname !== "/" && !user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // NOTE: you *must* return the supabaseResponse object as it is. If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out of sync and terminate the user's session prematurely!
  return supabaseResponse;
}
