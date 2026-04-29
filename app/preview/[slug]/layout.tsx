import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/common/SEO";
import { getConfigBySlug } from "@/lib/getConfig";
import { themeStyle } from "@/lib/themeLoader";

type Params = { slug: string };

export default async function PreviewSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const config = await getConfigBySlug(slug);
  if (!config) notFound();

  return (
    <div
      className="flex min-h-screen flex-col text-[var(--brand-text)]"
      style={{
        ...themeStyle(config),
        backgroundColor: "var(--brand-background)",
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 0% 0%, color-mix(in srgb, var(--brand-secondary) 35%, transparent) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 100% 100%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 60%)",
        backgroundAttachment: "fixed",
      }}
    >
      <StructuredData config={config} />
      <Navbar app={config.app} />
      <main className="flex-1">{children}</main>
      <Footer app={config.app} />
    </div>
  );
}
