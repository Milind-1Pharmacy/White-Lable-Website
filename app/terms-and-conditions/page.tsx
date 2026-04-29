import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Terms & Conditions");
}

export default async function TermsPage() {
  const { app } = await getConfig();
  return (
    <SectionWrapper eyebrow="Legal" heading="Terms & Conditions">
      <article className="prose prose-neutral max-w-3xl space-y-4 text-[var(--brand-text)]/85">
        <p>
          By using this website, you agree to the terms below. These terms
          govern your access to and use of the {app.tenant.name} website.
        </p>
        <h3>Use of content</h3>
        <p>
          The content on this website is provided for general informational
          purposes. You may view and share it for personal, non-commercial use.
        </p>
        <h3>No professional advice</h3>
        <p>
          Information published here is not a substitute for professional
          advice. Please consult a qualified practitioner for specific
          recommendations.
        </p>
        <h3>Changes</h3>
        <p>
          We may update these terms from time to time. Continued use of the
          website after changes are posted constitutes acceptance of the
          updated terms.
        </p>
      </article>
    </SectionWrapper>
  );
}
