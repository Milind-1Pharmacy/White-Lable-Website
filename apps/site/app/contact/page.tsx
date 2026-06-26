/**
 * @file page.tsx
 * @description Contact route page that displays support-only contact details.
 * @responsibilities
 *  - Load tenant config and build Contact page metadata.
 *  - Render optional eyebrow, heading, and lede text.
 *  - Show contact details via the ContactDisplay component.
 * @dependencies getConfig, buildMetadata, ContactDisplay
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";

import { getConfig } from "@wl/render-engine/lib/getConfig";
import { buildMetadata } from "@wl/render-engine/lib/seoBuilder";
import { ContactDisplay } from "@wl/render-engine/components/forms/ContactDisplay";

/**
 * generateMetadata - Builds SEO metadata for the Contact page.
 * @returns Next.js Metadata for the Contact route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Contact", "/contact");
}

/**
 * ContactPage - Shows tenant contact info in a legal-page shell that clears the nav.
 * @returns JSX element
 */
export default async function ContactPage() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.contact;

  return (
    <section className="legal-page">
      <div className="legal-wrap">
        {page?.eyebrow && <p className="legal-eyebrow">{page.eyebrow}</p>}
        <h1 className="legal-heading">{page?.heading ?? app.tenant.name}</h1>
        {page?.lede && <p className="legal-intro">{page.lede}</p>}
        <ContactDisplay contact={app.contact} />
      </div>
    </section>
  );
}
