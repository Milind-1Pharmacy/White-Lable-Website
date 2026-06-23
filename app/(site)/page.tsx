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
import { SectionRenderer } from "@/modules/SectionRenderer";
import { resolveRenderOrder, aboutHasContent } from "@/lib/renderOrder";

export const revalidate = 3600;

/**
 * HomePage - Renders the full landing page from config sections, in the order
 * resolved from content.order (or the legacy fixed order when absent).
 * @returns JSX element
 */
export default async function HomePage() {
  const { app } = await getConfig();
  const { content, branding } = app;

  const hasAbout = aboutHasContent(content);
  const services = content.services ?? [];
  const blocks = resolveRenderOrder(content);

  return (
    <>
      {blocks.map((b) => {
        if (b.kind === "hero") return <Hero key="hero" data={content.hero} />;
        if (b.kind === "about")
          return hasAbout ? <About key="about" data={content.about} /> : null;
        if (b.kind === "services")
          return services.length > 0 ? (
            <Services key="services" data={services} meta={content.servicesMeta} />
          ) : null;
        // A dynamic section — SectionRenderer handles dispatch (incl. appStrip + branding).
        return (
          <SectionRenderer
            key={`section-${b.index}`}
            sections={[b.section]}
            branding={branding}
          />
        );
      })}
    </>
  );
}
