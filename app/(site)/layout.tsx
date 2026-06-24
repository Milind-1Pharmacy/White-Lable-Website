/**
 * @file layout.tsx
 * @description Shared layout for the public site: navbar, footer, and CTA.
 * @responsibilities
 *  - Load tenant config and build default metadata.
 *  - Apply tenant theme colors via inline CSS variables.
 *  - Wrap children with navbar, footer, sticky CTA, and structured data.
 * @dependencies getConfig, themeStyle, buildMetadata, Navbar, Footer, StickyCta
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyCta } from "@/components/layout/StickyCta";
import { StructuredData } from "@/components/common/SEO";
import { getConfig } from "@/lib/getConfig";
import { themeStyle } from "@/lib/themeLoader";
import { buildMetadata } from "@/lib/seoBuilder";

/**
 * generateMetadata - Builds default SEO metadata for the site.
 * @returns Next.js Metadata for the public site
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config);
}

export const revalidate = 3600;

/**
 * SiteLayout - Frames page content with navbar, footer, and theme.
 * @param {React.ReactNode} children - Page content to render
 * @returns JSX element
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();
  const tenant = process.env.TENANT ?? "app_master";
  // Resolve the colour-theme name: prefer branding.theme, else derive from the
  // legacy stylesheet path (e.g. "/urmedz.css" → "urmedz"), else the premium default.
  const branding = config.app.branding;
  const theme =
    branding?.theme ||
    (branding?.stylesheet || "").replace(/^.*\//, "").replace(/\.css$/, "") ||
    "default";

  return (
    <>
      {/* Shared site stylesheet (all blocks) + the chosen colour-theme tokens.
          Injected here (not the root layout) so they load for the render engine but
          never for the builder app at "/". blocks.css supplies structure; the theme
          file sets default colours, which the user's brand colours override via the
          bridged CSS vars in `themeStyle` below. */}
      <link rel="stylesheet" href="/site-css/blocks.css" />
      <link rel="stylesheet" href={`/site-css/themes/${theme}.tokens.css`} />
      <div
        data-tenant={tenant}
        className="flex min-h-screen flex-col text-[var(--brand-text)]"
        style={themeStyle(config)}
      >
        <StructuredData config={config} />
        <Navbar app={config.app} />
        <main className="flex-1">{children}</main>
        <Footer app={config.app} />
        <StickyCta config={config.app.layout?.stickyCta} />
      </div>
    </>
  );
}
