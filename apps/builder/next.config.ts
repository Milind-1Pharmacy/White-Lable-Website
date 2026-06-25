/**
 * @file next.config.ts
 * @description Next.js config for the BUILDER app — the authoring UI deployed to
 *  Vercel as a normal DYNAMIC Next.js app (API/uploads/publish flow, no static
 *  export). There is no STATIC_EXPORT dual mode here: the builder is never exported.
 * @responsibilities
 *  - Allow the remote image hosts the builder previews / uploads use.
 *  - Transpile the shared workspace packages (they ship TS/TSX source).
 * @author WhiteLabel Platform Team
 * @created 2026-06-25
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output` — a normal dynamic server build on Vercel.
  transpilePackages: ["@wl/render-engine", "@wl/config-types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.urmedz.in",
        pathname: "/wp-content/uploads/**",
      },
      // S3 bucket the website-builder uploads images to (lib/api/upload.ts).
      {
        protocol: "https",
        hostname: "1p-b2c-files.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
