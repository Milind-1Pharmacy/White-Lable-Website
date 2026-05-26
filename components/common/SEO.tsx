/**
 * @file SEO.tsx
 * @description Emits LocalBusiness JSON-LD structured data from config.
 * @responsibilities
 *  - Build schema.org LocalBusiness object from tenant and contact.
 *  - Include email, phone, address only when present.
 *  - Inject the JSON-LD as a script tag.
 * @dependencies ResolvedConfig config type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { ResolvedConfig } from "@/types/config.types";

type StructuredDataProps = {
  config: ResolvedConfig;
};

/**
 * StructuredData - Renders schema.org LocalBusiness JSON-LD for SEO.
 * @props {ResolvedConfig} config - Resolved tenant config with seo/contact
 * @returns JSX element
 */
export function StructuredData({ config }: StructuredDataProps) {
  const { tenant, contact, seo } = config.app;
  const json = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.name,
    description: seo.description,
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(contact?.address ? { address: contact.address } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
