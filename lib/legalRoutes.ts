/**
 * @file legalRoutes.ts
 * @description Shared mapping between the live legal page ROUTES and the builder's
 *  legal sub-section ids, plus the postMessage protocol used so footer/nav links
 *  to legal pages work INSIDE the builder preview iframe (where there is no router
 *  and a real navigation would load the wrong `(site)` config).
 * @responsibilities
 *  - LEGAL_ROUTE_TO_SECTION: "/privacy-policy" → "privacy", etc.
 *  - WB_LEGAL_NAV_MSG + isLegalNavMessage(): the iframe→parent bridge contract.
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */

/** The builder's five legal sub-sections (kept in sync with builderData LegalSectionId). */
export type LegalSectionKey = "contact" | "terms" | "privacy" | "disclaimer" | "dataDeletion";

/** Live route path → builder legal sub-section. Used to intercept footer/nav clicks. */
export const LEGAL_ROUTE_TO_SECTION: Record<string, LegalSectionKey> = {
  "/contact": "contact",
  "/terms-conditions": "terms",
  "/privacy-policy": "privacy",
  "/disclaimer": "disclaimer",
  "/deactivate-account": "dataDeletion",
  "/data-deletion": "dataDeletion",
};

/** postMessage `type` the preview iframe sends the builder to switch legal pages. */
export const WB_LEGAL_NAV_MSG = "wb:legal-nav";

/** The message payload shape. */
export type LegalNavMessage = { type: typeof WB_LEGAL_NAV_MSG; section: LegalSectionKey };

/** Narrow an arbitrary postMessage `data` to a LegalNavMessage. */
export function isLegalNavMessage(data: unknown): data is LegalNavMessage {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return d.type === WB_LEGAL_NAV_MSG && typeof d.section === "string";
}

/**
 * Resolve a human href to a legal section, if it points at a known legal route.
 * Strips trailing slashes and any query/hash. Returns null for non-legal hrefs.
 */
export function legalSectionForHref(href: string): LegalSectionKey | null {
  if (!href) return null;
  // Only same-origin path links — ignore absolute/external + pure anchors.
  if (/^[a-z]+:\/\//i.test(href) || href.startsWith("#")) return null;
  const path = href.split("#")[0].split("?")[0].replace(/\/+$/, "") || "/";
  return LEGAL_ROUTE_TO_SECTION[path] ?? null;
}
