import { loadEnvConfig } from "@next/env";
import path from "path";
import type { NextConfig } from "next";

loadEnvConfig(path.resolve(process.cwd(), "../.."), undefined, undefined, true);

const API_URL = process.env.API_URL ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  transpilePackages: ["@kth/ui", "@kth/validators", "@kth/db"],

  async rewrites() {
    return [
      // Business API routes — proxied to apps/api
      { source: "/api/brands",            destination: `${API_URL}/api/admin/brands` },
      { source: "/api/tyres",             destination: `${API_URL}/api/admin/tyres` },
      { source: "/api/tyres/:path*",      destination: `${API_URL}/api/admin/tyres/:path*` },
      { source: "/api/gallery",           destination: `${API_URL}/api/admin/gallery` },
      { source: "/api/gallery/:path*",    destination: `${API_URL}/api/admin/gallery/:path*` },
      // Forgot-password routes — proxied to apps/api
      { source: "/api/forgot-password/:path*", destination: `${API_URL}/api/auth/forgot-password/:path*` },
      // /api/auth/* is NOT rewritten — handled locally by NextAuth in apps/admin
    ];
  },
};

export default nextConfig;
