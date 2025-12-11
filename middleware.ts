import { NextRequest, NextResponse } from "next/server";
import { getSessionFromToken } from "@/lib/auth";

// Routes that require authentication
const protectedRoutes = ["/admin", "/profile"];

// Routes that should redirect if already logged in
const authRoutes = ["/login", "/register"];

// Admin-only routes
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  // Check route types
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // If accessing auth routes (login/register) while logged in
  if (isAuthRoute && sessionCookie) {
    const session = await getSessionFromToken(sessionCookie);
    if (session) {
      // Redirect based on role
      const redirectUrl = session.role === "admin" ? "/admin" : "/profile";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // If accessing protected routes without session
  if (isProtectedRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await getSessionFromToken(sessionCookie);
    if (!session) {
      // Invalid or expired token, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }

    // Check admin routes - only admin can access
    if (isAdminRoute && session.role !== "admin") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
