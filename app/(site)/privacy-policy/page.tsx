import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Privacy Policy");
}

export default async function PrivacyPolicyPage() {
  const { app } = await getConfig();
  return (
    <SectionWrapper eyebrow="Legal" heading="Privacy Policy">
      <article className="prose prose-neutral max-w-3xl space-y-4 text-[var(--brand-text)]/85">
        <p>
          {app.tenant.name} respects the privacy of every visitor to this
          website. This page describes the limited information we collect and
          how it is used.
        </p>
        <h3>Information we collect</h3>
        <p>
          We collect only the information you choose to provide — for example
          when you contact us by email or phone. We do not run trackers,
          advertising pixels, or third-party analytics on this informational
          website.
        </p>
        <h3>How we use information</h3>
        <p>
          Information you share with us is used solely to respond to your
          enquiry. We do not sell or share personal information with third
          parties.
        </p>
        <h3>Contact</h3>
        <p>
          For privacy questions, please contact us
          {app.contact?.email ? (
            <>
              {" "}at{" "}
              <a
                className="text-[var(--brand-primary)] underline-offset-4 hover:underline"
                href={`mailto:${app.contact.email}`}
              >
                {app.contact.email}
              </a>
            </>
          ) : null}
          .
        </p>
      </article>
    </SectionWrapper>
  );
}
