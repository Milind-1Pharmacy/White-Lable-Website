"use client";

/**
 * @file Footer.tsx
 * @description Site footer with branding, contact, link columns, and compliance disclaimer.
 * @responsibilities
 *  - Render tenant logo, description, and contact details from config.
 *  - Show optional headline, CTA, and link columns.
 *  - Always render the compliance disclaimer when present.
 *  - Smooth-scroll in-page anchors within the link's OWN document (works on the
 *    live site AND inside the builder preview iframe).
 * @dependencies next/image, next/link, AppConfig, renderRichHeading
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-24
 */
import Image from "next/image";
import Link from "next/link";
import type { AppConfig } from "@wl/config-types";
import { safeHref, safeSrc } from "@wl/render-engine/lib/safeUrl";
import { renderRichHeading } from "@wl/render-engine/modules/RichHeading";
import { postLegalNav, legalSectionForHref } from "@wl/render-engine/lib/legalRoutes";

type FooterProps = {
  app: AppConfig;
};

/**
 * Footer link click handler. Two preview-aware behaviours; on the live site both
 * fall through to normal navigation:
 *  1) In-page anchors (`/#id`) smooth-scroll within THIS link's own document
 *     (so they work inside the builder preview iframe too).
 *  2) Legal-page routes (`/privacy-policy`, …) clicked INSIDE the preview iframe
 *     post a message to the builder to show that authored page, instead of
 *     navigating to the live `(site)` route (which renders a different config).
 */
function onFooterNavClick(href: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    const win = e.currentTarget.ownerDocument.defaultView;
    const inPreview = !!win && win.parent !== win;

    // (2) Legal route inside the preview → tell the builder to switch pages.
    const section = legalSectionForHref(href);
    if (section && inPreview) {
      e.preventDefault();
      postLegalNav(win, section);
      return;
    }

    // (1) In-page anchor → smooth-scroll within this document.
    const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
    if (!hash) return; // a real page route on the live site — navigate normally
    const doc = e.currentTarget.ownerDocument;
    const target = doc.getElementById(hash);
    if (!target) return; // anchor not on this page — let it navigate normally
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

/**
 * Footer for every page. Renders config-driven content and the compliance disclaimer.
 */
export function Footer({ app }: FooterProps) {
  const year = new Date().getFullYear();
  // safeSrc rejects unsafe logo URLs (javascript:/data:text/html/…) from config.
  const fullLogo = safeSrc(app.branding?.logoFull) || safeSrc(app.branding?.logo);
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
                href={safeHref(footer.ctaHref, "/contact")}
                onClick={onFooterNavClick(safeHref(footer.ctaHref, "/contact"))}
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
                {app.contact?.address && <span>{app.contact.address}</span>}
                {(app.contact?.email || app.contact?.phone) && (
                  <span style={{ marginTop: 8 }}>
                    {app.contact?.email}
                    {app.contact?.email && app.contact?.phone ? " · " : ""}
                    {app.contact?.phone}
                  </span>
                )}
              </div>
            )}
          </div>

          {columns.map((col, i) => (
            <div key={i} className="footer__col">
              <h5>{col.heading}</h5>
              <ul>
                {col.links.map((l, li) => (
                  <li key={li}>
                    <Link href={safeHref(l.href)} onClick={onFooterNavClick(safeHref(l.href))}>
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
          {footer?.bottomTag && <span>{footer.bottomTag}</span>}
        </div>
      </div>
    </footer>
  );
}
