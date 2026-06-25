/**
 * @file page.tsx
 * @description Disclaimer page that renders the legal disclaimer text.
 * @responsibilities
 *  - Load tenant config and build page metadata.
 *  - Use page body, or fall back to compliance disclaimer text.
 *  - Render content as a legal article.
 * @dependencies getConfig, buildMetadata, SectionWrapper, LegalArticle
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { LegalArticle } from "@/components/common/LegalArticle";

/**
 * generateMetadata - Builds SEO metadata for the Disclaimer page.
 * @returns Next.js Metadata for the route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Disclaimer", "/disclaimer");
}

/**
 * DisclaimerPage - Shows the disclaimer, falling back to compliance text.
 * @returns JSX element
 */
export default async function DisclaimerPage() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.disclaimer;
  const body =
    page?.body && page.body.length > 0
      ? page.body
      : app.compliance?.disclaimer
        ? [app.compliance.disclaimer]
        : [];

  return (
    <SectionWrapper eyebrow={page?.eyebrow} heading={page?.heading}>
      <LegalArticle data={{ ...page, body, sections: page?.sections }} />
    </SectionWrapper>
  );
}
