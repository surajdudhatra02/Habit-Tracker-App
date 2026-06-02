import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local images from /public are always allowed.
    // Add external domains here if needed in future.
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
