/**
 * @file LegalPreview.tsx
 * @description Self-contained renderers for the legal/contact pages shown INSIDE
 *  the builder preview iframe. The live `(site)` legal pages are styled with
 *  Tailwind utility classes that the preview iframe does not load, so these emit
 *  plain semantic markup with `legal-*` classes styled by the shared
 *  `site-css/blocks/legal.css` block (which also ships to deploy → preview = live).
 * @responsibilities
 *  - LegalArticlePreview: render a LegalPage (intro + titled sections, p/list).
 *  - ContactPreview: render the support-only contact details grid.
 * @dependencies @wl/config-types (LegalPage / LegalBlock / Contact)
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import React from "react";
import type { Contact, LegalBlock, LegalPage } from "@wl/config-types";

/** Render one legal body block: a plain string / paragraph / ordered|unordered list. */
function Block({ block }: { block: string | LegalBlock }) {
  if (typeof block === "string") return <p className="legal-p">{block}</p>;
  if (block.type === "p") return <p className="legal-p">{block.text}</p>;
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag className={block.ordered ? "legal-list legal-list--ol" : "legal-list"}>
        {block.items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </Tag>
    );
  }
  return null;
}

/**
 * LegalArticlePreview - Render a full legal page (Privacy / Terms / Disclaimer /
 * Data-deletion) the same way the live `LegalArticle` lays it out, but with
 * iframe-safe classes. Renders an empty-state hint if the page has no content.
 */
export function LegalArticlePreview({ data }: { data?: LegalPage }) {
  const sections = data?.sections ?? [];
  const body = data?.body ?? [];
  const hasContent = !!data?.intro || body.length > 0 || sections.length > 0;

  return (
    <section className="legal-page">
      <div className="legal-wrap">
        {data?.eyebrow && <p className="legal-eyebrow">{data.eyebrow}</p>}
        <h1 className="legal-heading">{data?.heading || "Legal"}</h1>

        {!hasContent && (
          <p className="legal-empty">
            This page is empty. Open the editor and press “Reset to recommended” to fill it.
          </p>
        )}

        <article className="legal-article">
          {data?.intro && <p className="legal-intro">{data.intro}</p>}
          {body.map((b, i) => (
            <Block key={`b${i}`} block={b} />
          ))}
          {sections.map((s, i) => (
            <div key={`s${i}`} className="legal-section">
              {s.heading && <h2 className="legal-subhead">{s.heading}</h2>}
              {s.subheading && <h3 className="legal-subhead2">{s.subheading}</h3>}
              {s.body.map((b, j) => (
                <Block key={`s${i}b${j}`} block={b} />
              ))}
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}

/**
 * ContactPreview - Render the support-only contact page: heading + a small grid
 * of the email / phone / address the owner entered.
 */
export function ContactPreview({ contact, tenantName }: { contact?: Contact; tenantName: string }) {
  const items: Array<{ label: string; value: string; href?: string }> = [];
  if (contact?.email) items.push({ label: "Email", value: contact.email, href: `mailto:${contact.email}` });
  if (contact?.phone) items.push({ label: "Phone", value: contact.phone, href: `tel:${contact.phone}` });
  if (contact?.address) items.push({ label: "Address", value: contact.address });

  return (
    <section className="legal-page">
      <div className="legal-wrap">
        <p className="legal-eyebrow">Get in touch</p>
        <h1 className="legal-heading">{tenantName}</h1>
        <p className="legal-intro">
          We’re here to help with questions and support. Reach us through any of the channels below —
          this is for enquiries only, never for orders or payments.
        </p>

        {items.length === 0 ? (
          <p className="legal-empty">
            Add an email, phone or address in the editor to show your contact details here.
          </p>
        ) : (
          <div className="contact-grid">
            {items.map((it) => (
              <div key={it.label} className="contact-card">
                <p className="contact-label">{it.label}</p>
                {it.href ? (
                  <a className="contact-value" href={it.href}>
                    {it.value}
                  </a>
                ) : (
                  <p className="contact-value">{it.value}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
