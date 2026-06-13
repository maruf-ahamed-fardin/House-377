import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin", "/chat", "/profile", "/history", "/timeline", "/bazar-schedule"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for JWT token cookie
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/chat/:path*", "/profile/:path*", "/history/:path*", "/timeline/:path*", "/bazar-schedule/:path*"],
};
