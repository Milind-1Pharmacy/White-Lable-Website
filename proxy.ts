/**
 * @file proxy.ts
 * @description Next 16.2 edge handler that adds security headers to responses.
 *
 * ⚠️ DEV/PREVIEW ONLY. This build uses `output: "export"` (next.config.ts) and
 *    deploys static HTML to S3 behind CloudFront (`npm run deploy:<tenant>`).
 *    Edge handlers / middleware DO NOT RUN on a static export — so these headers
 *    are NOT present on the live site. Production security headers MUST be set at
 *    the CDN: attach a CloudFront response-headers policy (or Lambda@Edge). See
 *    docs/deploy-security-headers.md for the exact policy to mirror this file,
 *    including the ENFORCED (not Report-Only) CSP.
 *
 * @responsibilities
 *  - Set hardening headers on every matched response (dev/preview server only).
 *  - Skip static assets via the matcher config.
 * @dependencies NextResponse from next/server.
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-24
 */
import { NextResponse } from "next/server";

/**
 * Content-Security-Policy, shipped in Report-Only mode first: it logs violations
 * (so we can see what real traffic needs) WITHOUT blocking anything, then we flip
 * it to enforcing once clean. Sources reflect what the app actually loads:
 *  - Google Fonts CSS (fonts.googleapis.com) + font files (fonts.gstatic.com)
 *  - images from self / any https / data: (config-driven, incl. the S3 bucket)
 *  - API + S3 over connect-src
 *  - inline styles/scripts (Next bootstrap + the builder's CSS-in-JS) — to be
 *    tightened to nonces when CSP is enforced.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' https: data: blob:",
  "media-src 'self' https: data: blob:",
  "connect-src 'self' https://apiv2.1pharmacy.io https://*.amazonaws.com https://fonts.googleapis.com https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

/**
 * proxy - Edge handler adding security headers to each response.
 * @returns A NextResponse carrying hardening headers.
 */
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
