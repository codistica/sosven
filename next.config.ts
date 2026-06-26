import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "randomuser.me" }, // seeded sample portraits
    ],
  },
  // Mongoose ships optional native deps; keep it external to the server bundle.
  serverExternalPackages: ["mongoose"],
  experimental: {
    // Photo uploads flow through the report Server Action; the default 1MB
    // request cap rejects most phone photos before the action runs.
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
