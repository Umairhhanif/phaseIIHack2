/**
 * Next.js middleware for protected route checking.
 *
 * Redirects unauthenticated users to /signin when accessing /tasks/* routes.
 */

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Protected routes (require authentication)
  const protectedPaths = ["/tasks"];

  // Check if current path requires authentication
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Redirect to signin if accessing protected route without token
  if (isProtected && !token) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
