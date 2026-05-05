export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/chat/:path*", "/profile/:path*", "/history/:path*"],
};
