/**
 * @file page.tsx
 * @description Terms & Conditions page rendered as a legal article.
 * @responsibilities
 *  - Load tenant config and build page metadata.
 *  - Render terms content via LegalArticle.
 *  - Degrade gracefully when config fields are missing.
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
 * generateMetadata - Builds SEO metadata for the Terms & Conditions page.
 * @returns Next.js Metadata for the route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Terms & Conditions", "/terms-conditions");
}

/**
 * TermsPage - Shows the terms and conditions content.
 * @returns JSX element
 */
export default async function TermsPage() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.termsAndConditions;

  return (
    <SectionWrapper eyebrow={page?.eyebrow} heading={page?.heading}>
      <LegalArticle data={page} />
    </SectionWrapper>
  );
}
