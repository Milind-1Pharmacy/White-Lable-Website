/**
 * @file SEO.tsx
 * @description Emits LocalBusiness JSON-LD structured data from config.
 * @responsibilities
 *  - Build a rich schema.org LocalBusiness object from tenant, branding and contact.
 *  - Include url, logo, image, email, phone, address, sameAs (socials) when present.
 *  - Inject the JSON-LD as a script tag for rich-result eligibility.
 * @dependencies ResolvedConfig config type, resolveSiteUrl
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-24
 */
import type { ResolvedConfig } from "@/types/config.types";
import { resolveSiteUrl } from "@/lib/seoBuilder";

type StructuredDataProps = {
  config: ResolvedConfig;
};

/** Make a possibly-relative asset path (e.g. /logo.png) absolute against the site origin. */
function absolute(siteUrl: string, path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return siteUrl + (path.startsWith("/") ? path : `/${path}`);
}

/**
 * StructuredData - Renders a rich schema.org LocalBusiness JSON-LD for SEO. Every
 * optional field is included only when present, so it degrades gracefully.
 * @props {ResolvedConfig} config - Resolved tenant config with seo/contact/branding
 * @returns JSX element
 */
export function StructuredData({ config }: StructuredDataProps) {
  const { tenant, contact, seo, branding } = config.app;
  const siteUrl = resolveSiteUrl(config.app);
  const logo = absolute(siteUrl, branding?.logoFull ?? branding?.logo);
  const image = absolute(siteUrl, seo.ogImage) ?? logo;
  const sameAs = (seo.socialProfiles ?? []).filter((u) => /^https?:\/\//i.test(u));

  const json = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.name,
    description: seo.description,
    url: siteUrl,
    ...(logo ? { logo } : {}),
    ...(image ? { image } : {}),
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(contact?.address ? { address: contact.address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
