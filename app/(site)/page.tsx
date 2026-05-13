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
      <Hero data={app.content.hero} />
      <About data={app.content.about} />
      <Services data={app.content.services} />
      <SectionRenderer sections={app.content.sections} />
    </>
  );
}
