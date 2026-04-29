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
  return (
    <SectionWrapper
      eyebrow="Contact"
      heading={`Get in touch with ${app.tenant.name}`}
    >
      <p className="mb-8 max-w-2xl text-base leading-relaxed text-[var(--brand-text)]/75">
        We&apos;re happy to answer questions about our offerings. Reach out via
        any of the channels below and our team will get back to you.
      </p>
      <ContactDisplay contact={app.contact} />
    </SectionWrapper>
  );
}
