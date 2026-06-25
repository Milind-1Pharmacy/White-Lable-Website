/**
 * @file layout.tsx
 * @description Preview layout that frames a single tenant config by slug.
 * @responsibilities
 *  - Load tenant config from the slug; 404 when not found.
 *  - Apply tenant theme and a decorative gradient background.
 *  - Wrap preview content with navbar, footer, and structured data.
 * @dependencies getConfigBySlug, themeStyle, Navbar, Footer, notFound
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { notFound } from "next/navigation";

import { Navbar } from "@wl/render-engine/components/layout/Navbar";
import { Footer } from "@wl/render-engine/components/layout/Footer";
import { StructuredData } from "@wl/render-engine/components/common/SEO";
import { getConfigBySlug } from "@wl/render-engine/lib/getConfig";
import { themeStyle } from "@wl/render-engine/lib/themeLoader";

type Params = { slug: string };

/**
 * PreviewSlugLayout - Frames a tenant preview with its own theme.
 * @param {React.ReactNode} children - Preview page content
 * @param {Promise<Params>} params - Route params holding the tenant slug
 * @returns JSX element
 */
export default async function PreviewSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const config = await getConfigBySlug(slug);
  if (!config) notFound();

  return (
    <div
      className="flex min-h-screen flex-col text-[var(--brand-text)]"
      style={{
        ...themeStyle(config),
        backgroundColor: "var(--brand-background)",
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 0% 0%, color-mix(in srgb, var(--brand-secondary) 35%, transparent) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 100% 100%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 60%)",
        backgroundAttachment: "fixed",
      }}
    >
      <StructuredData config={config} />
      <Navbar app={config.app} />
      <main className="flex-1">{children}</main>
      <Footer app={config.app} />
    </div>
  );
}
