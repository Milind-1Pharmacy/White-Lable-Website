/**
 * @file next.config.ts
 * @description Next.js config for static export to S3/CloudFront.
 * @responsibilities
 *  - Enable static HTML export output.
 *  - Disable image optimization for static hosting.
 *  - Allow remote image patterns and trailing-slash URLs.
 * @dependencies NextConfig type from next.
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Static export ships HTML to S3/CDN — Next's image optimizer needs
  // a Node runtime, so we disable it. Images are served as-is from /public.
  images: {
    unoptimized: true,
  },
  // Static export prefers trailing slashes so /about → /about/index.html,
  // which S3 + CloudFront serve cleanly without rewrites.
  trailingSlash: true,
};

export default nextConfig;
