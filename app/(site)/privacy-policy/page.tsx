import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { LegalArticle } from "@/components/common/LegalArticle";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Privacy Policy");
}

export default async function PrivacyPolicyPage() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.privacyPolicy;

  return (
    <SectionWrapper eyebrow={page?.eyebrow} heading={page?.heading}>
      <LegalArticle data={page} />
    </SectionWrapper>
  );
}
