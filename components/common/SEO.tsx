import type { ResolvedConfig } from "@/types/config.types";

type StructuredDataProps = {
  config: ResolvedConfig;
};

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
