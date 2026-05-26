/**
 * @file page.tsx
 * @description Deactivate Account page that renders account closure instructions.
 * @responsibilities
 *  - Load tenant config and build page metadata.
 *  - Render the deactivate-account content as a legal article.
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

export const revalidate = 3600;

/**
 * generateMetadata - Builds SEO metadata for the Deactivate Account page.
 * @returns Next.js Metadata for the route
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Deactivate Account");
}

/**
 * DeactivateAccountPage - Shows account deactivation instructions.
 * @returns JSX element
 */
export default async function DeactivateAccountPage() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.deactivateAccount;

  return (
    <SectionWrapper eyebrow={page?.eyebrow} heading={page?.heading}>
      <LegalArticle data={page} />
    </SectionWrapper>
  );
}
