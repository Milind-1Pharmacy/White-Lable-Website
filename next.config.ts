import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Static export ships HTML to S3/CDN — Next's image optimizer needs
  // a Node runtime, so we disable it. Images are served as-is from /public.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.urmedz.in",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  // Static export prefers trailing slashes so /about → /about/index.html,
  // which S3 + CloudFront serve cleanly without rewrites.
  trailingSlash: true,
};

export default nextConfig;
