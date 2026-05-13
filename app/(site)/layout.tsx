import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyCta } from "@/components/layout/StickyCta";
import { StructuredData } from "@/components/common/SEO";
import { getConfig } from "@/lib/getConfig";
import { themeStyle } from "@/lib/themeLoader";
import { buildMetadata } from "@/lib/seoBuilder";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config);
}

export const revalidate = 3600;

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();
  const tenant = process.env.TENANT ?? "app_master";
  const isUrmedz = tenant === "urmedz";

  return (
    <>
      <div
        data-tenant={tenant}
        className="flex min-h-screen flex-col"
        style={themeStyle(config)}
      >
        <StructuredData config={config} />
        <Navbar app={config.app} />
        <main className="flex-1">{children}</main>
        <Footer app={config.app} />
        {isUrmedz && <StickyCta />}
      </div>
    </>
  );
}
