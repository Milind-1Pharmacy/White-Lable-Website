/**
 * @file page.tsx
 * @description Root route entry for the Website Builder. The builder is its own
 *  app served at "/" (the (builder) route group owns the base URL); there is no
 *  "/builder" path. All builder source lives under ./builder/.
 * @responsibilities
 *  - Mount the client-side WebsiteBuilder authoring UI at the base URL.
 * @dependencies ./builder/WebsiteBuilder
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-23
 */
"use client";

import WebsiteBuilder from "./builder/WebsiteBuilder";

export default function BuilderPage() {
  return <WebsiteBuilder />;
}
