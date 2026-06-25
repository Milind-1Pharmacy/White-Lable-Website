/**
 * @file next.config.ts
 * @description Next.js config for the SITE app — the public tenant render engine.
 *  This app is ALWAYS a static export (S3/CloudFront); there is no builder here and
 *  no dual build mode, so `output: "export"` is unconditional (the old STATIC_EXPORT
 *  env flag is gone — it only existed to share one Next app between the static site
 *  and the dynamic builder, which now live in separate workspaces).
 * @responsibilities
 *  - Emit a static HTML export to ./out for the CDN.
 *  - Disable image optimization (no Node runtime on the CDN).
 *  - Allow remote image hosts and trailing-slash URLs.
 *  - Transpile the shared workspace packages (they ship TS/TSX source).
 * @author WhiteLabel Platform Team
 * @created 2026-06-25
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Always a static export — this app has no dynamic surface.
  output: "export",
  // Compile the shared workspace packages from source.
  transpilePackages: ["@wl/render-engine", "@wl/config-types"],
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
