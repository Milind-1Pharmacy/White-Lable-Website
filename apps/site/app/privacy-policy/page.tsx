/**
 * @file page.tsx
 * @description Privacy Policy page that renders the policy as a legal article.
 * @responsibilities
 *  - Load tenant config and build page metadata.
 *  - Render privacy-policy content via LegalArticle.
 *  - Degrade gracefully when config fields are missing.
 * @dependencies getConfig, buildMetadata, SectionWrapper, LegalArticle
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";

import { getConfig } from "@wl/render-engine/lib/getConfig";
import { buildMetadata } from "@wl/render-engine/lib/seoBuilder";
import { SectionWrapper } from "@wl/render-engine/components/common/SectionWrapper";
import { LegalArticle } from "@wl/render-engine/components/common/LegalArticle";

/**
 * generateMetadata - Builds SEO metadata for the Privacy Policy page.
 * @returns Next.js Metadata for the route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Privacy Policy", "/privacy-policy");
}

/**
 * PrivacyPolicyPage - Shows the privacy policy content.
 * @returns JSX element
 */
export default async function PrivacyPolicyPage() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.privacyPolicy;

  return (
    <SectionWrapper eyebrow={page?.eyebrow} heading={page?.heading}>
      <LegalArticle data={page} />
    </SectionWrapper>
  );
}
