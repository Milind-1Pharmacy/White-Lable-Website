/**
 * @file sitemap.ts
 * @description Generates /sitemap.xml at build time (static export) listing every
 *  public page for the active tenant, so search engines can discover and index
 *  them — satisfies the SEO "sitemap" expectation.
 * @dependencies next MetadataRoute, getConfig, resolveSiteUrl
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import type { MetadataRoute } from "next";
import { getConfig } from "@wl/render-engine/lib/getConfig";
import { resolveSiteUrl } from "@wl/render-engine/lib/seoBuilder";

export const dynamic = "force-static";

/** The public, indexable routes (excludes internal /site + /preview). Homepage = "". */
const PUBLIC_PATHS = [
  "",
  "/about",
  "/services",
  "/contact",
  "/privacy-policy",
  "/terms-conditions",
  "/disclaimer",
  "/deactivate-account",
];

/** sitemap - One entry per public page, with the homepage given top priority. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { app } = await getConfig();
  const siteUrl = resolveSiteUrl(app);
  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}/`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
