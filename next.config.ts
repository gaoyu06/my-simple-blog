import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents enabled in the perf hardening phase
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-icons",
    ],
  },
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2", "shiki", "satori", "@resvg/resvg-js"],
};

export default nextConfig;
