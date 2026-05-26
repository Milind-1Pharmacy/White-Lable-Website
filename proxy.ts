/**
 * @file proxy.ts
 * @description Next 16.2 edge handler that adds security headers to responses.
 * @responsibilities
 *  - Set hardening headers on every matched response.
 *  - Skip static assets via the matcher config.
 * @dependencies NextResponse from next/server.
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { NextResponse } from "next/server";

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
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
