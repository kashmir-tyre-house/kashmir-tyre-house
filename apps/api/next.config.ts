import { loadEnvConfig } from "@next/env";
import path from "path";
import type { NextConfig } from "next";

loadEnvConfig(path.resolve(process.cwd(), "../.."), undefined, undefined, true);

const nextConfig: NextConfig = {
  transpilePackages: ["@kth/db", "@kth/validators"]
};

export default nextConfig;
