import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Proxy /api/* requests to the Express backend during development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
