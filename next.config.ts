import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Only optimize our own uploads; an open remote pattern turns the
    // optimizer into a public image proxy.
    localPatterns: [{ pathname: "/uploads/**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2", "shiki"],
};

export default nextConfig;
