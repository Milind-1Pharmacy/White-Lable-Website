import { getConfig } from "@/lib/getConfig";
import { Hero } from "@/modules/Hero";
import { About } from "@/modules/About";
import { Services } from "@/modules/Services";
import { SectionRenderer } from "@/modules/SectionRenderer";

export const revalidate = 3600;

export default async function HomePage() {
  const { app } = await getConfig();
  const { hero, about, services, sections } = app.content;
  return (
    <>
      {hero?.headline && <Hero content={hero} tenant={app.tenant} />}
      {about?.description && <About content={about} tenant={app.tenant} />}
      {services && services.length > 0 && <Services items={services} />}
      <SectionRenderer sections={sections} />
    </>
  );
}
