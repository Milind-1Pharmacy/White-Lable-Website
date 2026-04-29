import type { Metadata } from "next";

import type { ResolvedConfig } from "@/types/config.types";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function buildMetadata(config: ResolvedConfig, pageTitle?: string): Metadata {
  const { seo, tenant } = config.app;
  const title = pageTitle ? `${pageTitle} | ${tenant.name}` : seo.title;
  const ogImages = seo.ogImage
    ? [{ url: seo.ogImage, width: 1200, height: 630, alt: tenant.name }]
    : undefined;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description: seo.description,
    keywords: seo.keywords,
    applicationName: tenant.name,
    openGraph: {
      title,
      description: seo.description,
      siteName: tenant.name,
      type: "website",
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seo.description,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}
