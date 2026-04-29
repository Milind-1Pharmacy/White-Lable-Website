import { getConfig } from "@/lib/getConfig";
import { Hero } from "@/modules/Hero";
import { About } from "@/modules/About";
import { Services } from "@/modules/Services";
import { SectionRenderer } from "@/modules/SectionRenderer";

export const revalidate = 3600;

export default async function HomePage() {
  const { app } = await getConfig();
  return (
    <>
      <Hero content={app.content.hero} tenant={app.tenant} />
      <About content={app.content.about} tenant={app.tenant} />
      <Services items={app.content.services} />
      <SectionRenderer sections={app.content.sections} />
    </>
  );
}
