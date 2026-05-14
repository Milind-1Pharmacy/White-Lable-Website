import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { ContactDisplay } from "@/components/forms/ContactDisplay";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Contact");
}

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
