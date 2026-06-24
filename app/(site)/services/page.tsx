/**
 * @file page.tsx
 * @description Services route page listing services and how-it-works content.
 * @responsibilities
 *  - Load tenant config and build Services page metadata.
 *  - Render the Services module when services exist.
 *  - Render any "howItWorks" sections via the dispatcher.
 * @dependencies getConfig, buildMetadata, Services, SectionRenderer
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { Services } from "@/modules/Services";
import { SectionRenderer } from "@/modules/SectionRenderer";

export const revalidate = 3600;

/**
 * generateMetadata - Builds SEO metadata for the Services page.
 * @returns Next.js Metadata for the Services route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Services", "/services");
}

/**
 * ServicesPage - Shows services plus any how-it-works sections.
 * @returns JSX element
 */
export default async function ServicesPage() {
  const { app } = await getConfig();
  const services = app.content.services ?? [];
  return (
    <>
      {services.length > 0 && (
        <Services data={services} meta={app.content.servicesMeta} />
      )}
      <SectionRenderer
        sections={app.content.sections.filter((s) => s.type === "howItWorks")}
        branding={app.branding}
      />
    </>
  );
}
