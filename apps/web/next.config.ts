import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kth/ui", "@kth/validators"]
};

export default nextConfig;
