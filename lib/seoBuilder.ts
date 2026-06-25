/**
 * @file seoBuilder.ts
 * @description Builds Next.js Metadata from a tenant's SEO config.
 * @responsibilities
 *  - Compose page titles, description, and keywords.
 *  - Build Open Graph and Twitter card metadata (incl. canonical url).
 *  - Resolve the canonical site URL (tenant siteUrl → env → localhost).
 *  - Emit an explicit robots directive (index/follow) for crawlers.
 * @dependencies next Metadata, @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-24
 */
import type { Metadata } from "next";

import type { ResolvedConfig, AppConfig } from "@wl/config-types";
import { safeSrc } from "@/lib/safeUrl";

const envSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * resolveSiteUrl - The canonical absolute origin for this tenant. Prefers the
 * tenant's own `seo.siteUrl`, falls back to NEXT_PUBLIC_SITE_URL, then localhost.
 * Trailing slash stripped so callers can append paths cleanly.
 */
export function resolveSiteUrl(app?: AppConfig): string {
  const raw = app?.seo?.siteUrl?.trim() || envSiteUrl;
  return raw.replace(/\/+$/, "");
}

/**
 * buildMetadata - Builds page Metadata from the resolved tenant SEO config.
 * @param {ResolvedConfig} config - The resolved tenant config.
 * @param {string} [pageTitle] - Optional page name prefixed to the title.
 * @param {string} [path] - The page's path (e.g. "/privacy-policy") for its canonical URL.
 * @returns A Next.js Metadata object.
 */
export function buildMetadata(config: ResolvedConfig, pageTitle?: string, path = "/"): Metadata {
  const { seo, tenant } = config.app;
  const siteUrl = resolveSiteUrl(config.app);
  const title = pageTitle ? `${pageTitle} | ${tenant.name}` : seo.title;
  // Canonical absolute URL for THIS page — collapses duplicate-content paths.
  const canonical = siteUrl + (path === "/" ? "/" : path.replace(/\/+$/, ""));
  // Drop an unsafe ogImage URL (javascript:/data:text/html/…) before it reaches
  // the OG/Twitter meta tags.
  const ogImage = safeSrc(seo.ogImage);
  const ogImages = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: tenant.name }]
    : undefined;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description: seo.description,
    keywords: seo.keywords,
    applicationName: tenant.name,
    // Explicit canonical so search engines index one URL per page.
    alternates: { canonical },
    // Allow indexing + following, with sensible large-preview defaults.
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      title,
      description: seo.description,
      siteName: tenant.name,
      type: "website",
      url: canonical,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seo.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
