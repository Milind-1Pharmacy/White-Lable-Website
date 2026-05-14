import { getConfig } from "@/lib/getConfig";
import { Hero } from "@/modules/Hero";
import { About } from "@/modules/About";
import { Services } from "@/modules/Services";
import { AppStrip } from "@/modules/AppStrip";
import { SectionRenderer } from "@/modules/SectionRenderer";
import type { AppStripSectionData } from "@/types/config.types";

export const revalidate = 3600;

export default async function HomePage() {
  const { app } = await getConfig();

  const appStripSection = app.content.sections.find((s) => s.type === "appStrip");
  const remainingSections = app.content.sections.filter((s) => s.type !== "appStrip");

  return (
    <>
      <Hero data={app.content.hero} />
      {appStripSection && (
        <AppStrip data={appStripSection.data as AppStripSectionData} />
      )}
      <About data={app.content.about} />
      <Services data={app.content.services} />
      <SectionRenderer sections={remainingSections} />
    </>
  );
}
