/**
 * @file page.tsx
 * @description Home page that assembles hero, app strip, about, services, and more.
 * @responsibilities
 *  - Load tenant config content and branding.
 *  - Render hero, optional app strip, about, and services sections.
 *  - Dispatch remaining config sections via SectionRenderer.
 * @dependencies getConfig, Hero, About, Services, AppStrip, SectionRenderer
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { getConfig } from "@/lib/getConfig";
import { Hero } from "@/modules/Hero";
import { About } from "@/modules/About";
import { Services } from "@/modules/Services";
import { AppStrip } from "@/modules/AppStrip";
import { SectionRenderer } from "@/modules/SectionRenderer";
import type { AppStripSectionData } from "@/types/config.types";

export const revalidate = 3600;

/**
 * HomePage - Renders the full landing page from config sections.
 * @returns JSX element
 */
export default async function HomePage() {
  const { app } = await getConfig();
  const { content, branding } = app;

  const appStripSection = content.sections.find((s) => s.type === "appStrip");
  const remainingSections = content.sections.filter(
    (s) => s.type !== "appStrip",
  );

  const hasAbout =
    !!content.about &&
    (!!content.about.eyebrow ||
      !!content.about.title ||
      !!content.about.lede ||
      !!content.about.description ||
      !!(content.about.pillars && content.about.pillars.length));

  const services = content.services ?? [];

  return (
    <>
      <Hero data={content.hero} />
      {appStripSection && (
        <AppStrip
          data={appStripSection.data as AppStripSectionData}
          branding={branding}
        />
      )}
      {hasAbout && <About data={content.about} />}
      {services.length > 0 && (
        <Services data={services} meta={content.servicesMeta} />
      )}
      <SectionRenderer sections={remainingSections} branding={branding} />
    </>
  );
}
