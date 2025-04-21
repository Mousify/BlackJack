import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth condition
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute =
    req.nextUrl.pathname === "/profile" ||
    req.nextUrl.pathname === "/play" ||
    req.nextUrl.pathname === "/multiplayer" ||
    req.nextUrl.pathname.startsWith("/multiplayer/");

  // If user is not signed in and the route is protected, redirect to sign in
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL("/auth/signin", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and trying to access auth routes, redirect to home
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

// Only run middleware on matching routes
export const config = {
  matcher: ["/api/:path*"], // only protect API endpoints
};
