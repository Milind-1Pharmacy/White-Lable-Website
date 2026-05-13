import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.urmedz.in",
      },
    ],
  },
};

export default nextConfig;
