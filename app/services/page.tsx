import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { Services } from "@/modules/Services";
import { SectionRenderer } from "@/modules/SectionRenderer";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "Services");
}

export default async function ServicesPage() {
  const { app } = await getConfig();
  return (
    <>
      <Services
        items={app.content.services}
        heading={`Services from ${app.tenant.name}`}
      />
      <SectionRenderer
        sections={app.content.sections.filter((s) => s.type === "howItWorks")}
      />
    </>
  );
}
