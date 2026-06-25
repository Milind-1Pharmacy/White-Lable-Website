/**
 * @file page.tsx
 * @description Contact route page that displays support-only contact details.
 * @responsibilities
 *  - Load tenant config and build Contact page metadata.
 *  - Render optional eyebrow, heading, and lede text.
 *  - Show contact details via the ContactDisplay component.
 * @dependencies getConfig, buildMetadata, SectionWrapper, ContactDisplay
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { ContactDisplay } from "@/components/forms/ContactDisplay";

/**
 * generateMetadata - Builds SEO metadata for the Contact page.
 * @returns Next.js Metadata for the Contact route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Contact", "/contact");
}

/**
 * ContactPage - Shows tenant contact info inside a section wrapper.
 * @returns JSX element
 */
export default async function ContactPage() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.contact;

  return (
    <SectionWrapper
      eyebrow={page?.eyebrow}
      heading={page?.heading ?? app.tenant.name}
    >
      {page?.lede && (
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-[var(--brand-text)]/75">
          {page.lede}
        </p>
      )}
      <ContactDisplay contact={app.contact} />
    </SectionWrapper>
  );
}
