/**
 * @file page.tsx
 * @description Route entry for the Website Builder (/builder).
 * @responsibilities
 *  - Mount the client-side WebsiteBuilder authoring UI.
 * @dependencies ./WebsiteBuilder
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-22
 */
"use client";

import WebsiteBuilder from "./WebsiteBuilder";

export default function BuilderPage() {
  return <WebsiteBuilder />;
}
