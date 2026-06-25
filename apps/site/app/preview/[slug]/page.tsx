/**
 * @file page.tsx
 * @description Per-tenant preview page rendered from a config slug.
 * @responsibilities
 *  - Build a static preview page for each tenant config.
 *  - Render Hero, About, Services, and config-driven sections.
 *  - Mark preview pages noindex so they stay out of search.
 * @dependencies next/link, next/navigation, getConfigBySlug, listConfigs, buildMetadata, modules
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Hero } from "@wl/render-engine/modules/Hero";
import { About } from "@wl/render-engine/modules/About";
import { Services } from "@wl/render-engine/modules/Services";
import { SectionRenderer } from "@wl/render-engine/modules/SectionRenderer";
import { getConfigBySlug, listConfigs } from "@wl/render-engine/lib/getConfig";
import { buildMetadata } from "@wl/render-engine/lib/seoBuilder";

type Params = { slug: string };

// Static-parseable literal (Next reads it at compile time) AND required to be
// `false` under `output: "export"`. So generateStaticParams MUST return a
// non-empty set in every mode — anything not listed simply isn't reachable.
export const dynamicParams = false;

/**
 * List preview slugs to pre-render.
 *
 * The contract that matters: a PRODUCTION tenant deploy must never ship another
 * tenant's preview. The tenant pipeline builds `TENANT=<slug> next build` (see
 * buildspec.yml), so when TENANT is set we emit ONLY that tenant's preview — no
 * cross-tenant leak.
 *
 * With no TENANT (the builder on Vercel, or local dev) we list every config.
 * These extra static preview pages are harmless on the builder app and keep the
 * set non-empty, which `output: "export"` + `dynamicParams = false` requires.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const tenants = await listConfigs();
  const tenant = process.env.TENANT?.trim();
  if (tenant) {
    const slug = tenant.endsWith(".json") ? tenant.slice(0, -5) : tenant;
    // Scope to this tenant when it matches a real config. If it matches nothing
    // (e.g. a stale TENANT left on a non-tenant deploy), fall through to listing
    // all rather than returning [] — an empty set breaks `output: export`.
    if (tenants.some((t) => t.slug === slug)) return [{ slug }];
  }
  return tenants.map((t) => ({ slug: t.slug }));
}

/** Build SEO metadata for a preview slug; preview pages are noindex. */
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

/** Render the preview page for a single tenant config, or 404 if missing. */
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

      <Hero data={app.content.hero} />
      <About data={app.content.about} />
      {app.content.services && app.content.services.length > 0 && (
        <Services
          data={app.content.services}
          meta={app.content.servicesMeta}
        />
      )}
      <SectionRenderer
        sections={app.content.sections}
        branding={app.branding}
      />
    </>
  );
}
