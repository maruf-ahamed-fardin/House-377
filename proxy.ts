export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/chat/:path*", "/profile/:path*", "/history/:path*"],
};
