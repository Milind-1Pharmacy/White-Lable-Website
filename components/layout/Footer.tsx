/**
 * @file Footer.tsx
 * @description Site footer with branding, contact, link columns, and compliance disclaimer.
 * @responsibilities
 *  - Render tenant logo, description, and contact details from config.
 *  - Show optional headline, CTA, and link columns.
 *  - Always render the compliance disclaimer when present.
 * @dependencies next/image, next/link, AppConfig, renderRichHeading
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import Image from "next/image";
import Link from "next/link";
import type { AppConfig } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";

type FooterProps = {
  app: AppConfig;
};

/**
 * Footer for every page. Renders config-driven content and the compliance disclaimer.
 */
export function Footer({ app }: FooterProps) {
  const year = new Date().getFullYear();
  const fullLogo = app.branding?.logoFull ?? app.branding?.logo;
  const footer = app.layout?.footer;
  const headline = renderRichHeading(footer?.headline);
  const columns = footer?.columns ?? [];
  const hasContact =
    !!(app.contact?.address || app.contact?.email || app.contact?.phone);

  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        {(headline || footer?.ctaLabel) && (
          <div
            className="between"
            style={{ alignItems: "end", flexWrap: "wrap", gap: 32 }}
          >
            {headline && (
              <h2
                className="h-display h-big"
                style={{ maxWidth: 980, lineHeight: 0.92 }}
              >
                {headline}
              </h2>
            )}
            {footer?.ctaLabel && (
              <Link
                href={footer.ctaHref ?? "/contact"}
                className="btn btn-accent"
                style={{ padding: "18px 28px" }}
              >
                {footer.ctaLabel}
              </Link>
            )}
          </div>
        )}

        <div className="footer__grid">
          <div className="footer__col">
            {fullLogo && (
              <div
                style={{
                  background: "var(--cream)",
                  borderRadius: 14,
                  padding: "18px 22px",
                  display: "inline-block",
                  marginBottom: 22,
                }}
              >
                <Image
                  src={fullLogo}
                  alt={app.tenant.name}
                  width={140}
                  height={56}
                  style={{ height: 56, width: "auto", display: "block" }}
                />
              </div>
            )}
            {footer?.description && (
              <p
                className="body-s"
                style={{ color: "rgba(244,239,230,.55)", maxWidth: 320 }}
              >
                {footer.description}
              </p>
            )}
            {hasContact && (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 13,
                  color: "rgba(244,239,230,.7)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {footer?.addressLabel && (
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: "rgba(244,239,230,.45)",
                    }}
                  >
                    {footer.addressLabel}
                  </span>
                )}
                {app.contact.address && <span>{app.contact.address}</span>}
                {(app.contact.email || app.contact.phone) && (
                  <span style={{ marginTop: 8 }}>
                    {app.contact.email}
                    {app.contact.email && app.contact.phone ? " · " : ""}
                    {app.contact.phone}
                  </span>
                )}
              </div>
            )}
          </div>

          {columns.map((col, i) => (
            <div key={i} className="footer__col">
              <h5>{col.heading}</h5>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      {...(l.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {app.compliance?.disclaimer && (
          <p className="footer__disc">{app.compliance.disclaimer}</p>
        )}

        <div className="footer__bottom">
          <span>
            © {year} {app.tenant.name}.
          </span>
          {footer?.bottomTag && (
            <span className="footer__tagline">{footer.bottomTag}</span>
          )}
        </div>
      </div>
    </footer>
  );
}
