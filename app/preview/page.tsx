import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { listConfigs } from "@/lib/getConfig";

export const metadata: Metadata = {
  title: "Tenant Preview — WhiteLabel Platform",
  description: "Internal: preview tenant configurations.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

export default async function PreviewIndex() {
  const tenants = await listConfigs();

  return (
    <main className="min-h-screen bg-neutral-50 py-16 sm:py-24">
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">
            Internal · Tenant preview
          </p>
          <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-tight tracking-tight text-neutral-900">
            Available tenants
          </h1>
          <p className="mt-4 text-base text-neutral-600 sm:text-lg">
            Each card below shows a tenant configuration found in{" "}
            <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs">
              configs/
            </code>
            . Click to preview the homepage rendered with that tenant&apos;s
            settings.
          </p>
        </div>

        {tenants.length === 0 ? (
          <p className="text-neutral-500">
            No tenant configs found. Add a JSON file to <code>configs/</code>{" "}
            (excluding <code>system.json</code> and{" "}
            <code>app_master.json</code>).
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((t) => (
              <Link
                key={t.slug}
                href={`/preview/${t.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg"
              >
                {/* Color preview band */}
                <div
                  aria-hidden
                  className="-mx-6 -mt-6 mb-6 h-24 rounded-t-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${t.colors?.primary ?? "#999"} 0%, ${t.colors?.secondary ?? "#ddd"} 60%, ${t.colors?.background ?? "#fff"} 100%)`,
                  }}
                />

                <div className="flex items-start gap-3">
                  {t.logo ? (
                    <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5">
                      <Image
                        src={t.logo}
                        alt={`${t.name} logo`}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ) : (
                    <span
                      className="inline-block h-10 w-10 rounded-full"
                      style={{ background: t.colors?.primary ?? "#999" }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-neutral-900">
                      {t.name}
                    </p>
                    {t.category ? (
                      <p className="truncate text-xs text-neutral-500">
                        {t.category}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Color swatches */}
                <div className="mt-5 flex items-center gap-2">
                  {(["primary", "secondary", "accent", "background", "text"] as const).map(
                    (key) => {
                      const c = t.colors?.[key];
                      if (!c) return null;
                      return (
                        <span
                          key={key}
                          className="block h-5 w-5 rounded-full ring-1 ring-black/5"
                          style={{ background: c }}
                          title={`${key}: ${c}`}
                        />
                      );
                    },
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <code className="text-xs text-neutral-500">{t.slug}.json</code>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 transition-colors group-hover:text-neutral-900">
                    Preview
                    <span
                      aria-hidden
                      className="inline-block translate-x-0 transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm font-medium text-neutral-900">
            How tenant switching works
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            The customer-facing site at{" "}
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-neutral-900"
            >
              /
            </Link>{" "}
            always renders <code>configs/app_master.json</code>. To go live
            with a different tenant, copy any{" "}
            <code>configs/&lt;slug&gt;.json</code> over{" "}
            <code>configs/app_master.json</code> and rebuild. This{" "}
            <code>/preview</code> route lets you visually inspect any tenant
            before swapping.
          </p>
        </div>
      </Container>
    </main>
  );
}
