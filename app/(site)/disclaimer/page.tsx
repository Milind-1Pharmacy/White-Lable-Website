import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { LegalArticle } from "@/components/common/LegalArticle";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Disclaimer");
}

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
