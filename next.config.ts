import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.urmedz.in",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
