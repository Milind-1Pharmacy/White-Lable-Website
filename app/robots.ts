/**
 * @file robots.ts
 * @description Generates /robots.txt at build time (static export). Allows all
 *  crawlers and points them at the sitemap, satisfying the Lighthouse "valid
 *  robots.txt" SEO audit.
 * @dependencies next MetadataRoute, getConfig, resolveSiteUrl
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/getConfig";
import { resolveSiteUrl } from "@/lib/seoBuilder";

export const dynamic = "force-static";

/** robots - Build the robots.txt rules + sitemap reference for the active tenant. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { app } = await getConfig();
  const siteUrl = resolveSiteUrl(app);
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/preview/", "/site/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
