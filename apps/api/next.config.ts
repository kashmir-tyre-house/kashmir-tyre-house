import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kth/db", "@kth/validators"]
};

export default nextConfig;
