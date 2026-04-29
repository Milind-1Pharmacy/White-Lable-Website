import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Hero } from "@/modules/Hero";
import { About } from "@/modules/About";
import { Services } from "@/modules/Services";
import { SectionRenderer } from "@/modules/SectionRenderer";
import { getConfigBySlug, listConfigs } from "@/lib/getConfig";
import { buildMetadata } from "@/lib/seoBuilder";

type Params = { slug: string };

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams(): Promise<Params[]> {
  const tenants = await listConfigs();
  return tenants.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = await getConfigBySlug(slug);
  if (!config) return { title: "Tenant not found" };
  const meta = buildMetadata(config, "Preview");
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function TenantPreviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const config = await getConfigBySlug(slug);
  if (!config) notFound();

  const { app } = config;

  return (
    <>
      {/* Preview banner */}
      <div className="sticky top-24 z-30 mx-auto max-w-7xl px-5 sm:top-28 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-900 px-5 py-3 text-white shadow-lg sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
            <p className="text-xs font-medium uppercase tracking-[0.2em]">
              Preview
            </p>
            <span className="text-sm text-neutral-200">
              <span className="text-neutral-500">·</span>{" "}
              <span className="font-medium text-white">{app.tenant.name}</span>{" "}
              <span className="text-neutral-500">({slug}.json)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/preview"
              className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:bg-white/10"
            >
              ← All tenants
            </Link>
            <Link
              href="/"
              className="rounded-full bg-white px-3 py-1 text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              Live site
            </Link>
          </div>
        </div>
      </div>

      <Hero content={app.content.hero} tenant={app.tenant} />
      <About content={app.content.about} tenant={app.tenant} />
      <Services items={app.content.services} />
      <SectionRenderer sections={app.content.sections} />
    </>
  );
}
