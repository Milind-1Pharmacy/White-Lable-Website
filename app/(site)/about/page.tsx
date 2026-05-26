/**
 * @file page.tsx
 * @description About route page that renders the About section and features.
 * @responsibilities
 *  - Load tenant config and build About page metadata.
 *  - Render the About module from config content.
 *  - Render any "features" sections via the dispatcher.
 * @dependencies getConfig, buildMetadata, About, SectionRenderer
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { About } from "@/modules/About";
import { SectionRenderer } from "@/modules/SectionRenderer";

export const revalidate = 3600;

/**
 * generateMetadata - Builds SEO metadata for the About page.
 * @returns Next.js Metadata for the About route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "About");
}

/**
 * AboutPage - Shows the About section plus any feature sections.
 * @returns JSX element
 */
export default async function AboutPage() {
  const { app } = await getConfig();
  return (
    <>
      <About data={app.content.about} />
      <SectionRenderer
        sections={app.content.sections.filter((s) => s.type === "features")}
        branding={app.branding}
      />
    </>
  );
}
