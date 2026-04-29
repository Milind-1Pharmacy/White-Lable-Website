import type { Metadata } from "next";

import { getConfig } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";
import { About } from "@/modules/About";
import { SectionRenderer } from "@/modules/SectionRenderer";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config, "About");
}

export default async function AboutPage() {
  const { app } = await getConfig();
  return (
    <>
      <About content={app.content.about} tenant={app.tenant} />
      <SectionRenderer
        sections={app.content.sections.filter((s) => s.type === "features")}
      />
    </>
  );
}
