/**
 * @file next.config.ts
 * @description Next.js config with TWO build modes for two deploy targets:
 *  - STATIC tenant sites (S3/CloudFront via CodeBuild): `output: "export"`.
 *  - The BUILDER app (Vercel): a normal dynamic Next.js app (no static export),
 *    so its API routes / uploads / publish flow keep working.
 *  The mode is selected by the STATIC_EXPORT env var, which the tenant pipeline
 *  (buildspec.yml) sets to "1". Vercel does NOT set it → dynamic builder build.
 * @responsibilities
 *  - Switch `output` between static export and a normal server build.
 *  - Disable image optimization for static hosting.
 *  - Allow remote image patterns and trailing-slash URLs.
 * @dependencies NextConfig type from next.
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-25
 */
import type { NextConfig } from "next";

// Tenant-site builds (CodeBuild/S3) set STATIC_EXPORT=1. The builder on Vercel
// leaves it unset and builds as a normal dynamic app.
const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Static HTML export ONLY for the tenant-site pipeline; the builder needs a
  // normal (server) build on Vercel, so leave `output` undefined there.
  output: STATIC_EXPORT ? "export" : undefined,
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
      // S3 bucket the website-builder uploads images to (see lib/api/upload.ts).
      {
        protocol: "https",
        hostname: "1p-b2c-files.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Static export prefers trailing slashes so /about → /about/index.html,
  // which S3 + CloudFront serve cleanly without rewrites.
  trailingSlash: true,
};

export default nextConfig;
