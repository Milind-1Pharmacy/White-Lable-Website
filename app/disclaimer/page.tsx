import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { SectionWrapper } from "@/components/common/SectionWrapper";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Disclaimer");
}

export default async function DisclaimerPage() {
  const { app } = await getConfig();
  return (
    <SectionWrapper eyebrow="Legal" heading="Disclaimer">
      <article className="prose prose-neutral max-w-3xl space-y-4 text-[var(--brand-text)]/85">
        <p className="font-medium">{app.compliance.disclaimer}</p>
        <p>
          The information presented on this website is provided in good faith
          for general informational purposes only. {app.tenant.name} makes no
          representation or warranty, express or implied, regarding the
          accuracy, adequacy, validity, reliability, availability, or
          completeness of any information on the site.
        </p>
        <p>
          Any reliance you place on such information is strictly at your own
          risk. We will not be liable for any loss or damage incurred as a
          result of the use of this website or the information contained
          herein.
        </p>
      </article>
    </SectionWrapper>
  );
}
