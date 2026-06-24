"use client";

/**
 * @file Navbar.tsx
 * @description Sticky top navigation with logo, links, CTAs, and mobile menu.
 * @responsibilities
 *  - Render config-driven nav links and CTA buttons.
 *  - Toggle a mobile menu and lock body scroll when open.
 *  - Add a scrolled state after the page scrolls past a threshold.
 * @dependencies next/image, next/link, react, AppConfig, NavCta
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AppConfig, NavCta } from "@/types/config.types";
import { safeHref } from "@/lib/safeUrl";
import { WB_LEGAL_NAV_MSG, legalSectionForHref } from "@/lib/legalRoutes";

type NavbarProps = {
  app: AppConfig;
};

/** Map a CTA variant to its button CSS class. */
function ctaClass(variant: NavCta["variant"]) {
  switch (variant) {
    case "primary":
      return "btn btn-primary";
    case "accent":
      return "btn btn-accent";
    case "ghost":
    default:
      return "btn btn-ghost";
  }
}

/**
 * Top navigation bar. Client component for scroll state and mobile menu toggling.
 */
export function Navbar({ app }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Detect scroll from the navbar's OWN document/window. In the builder preview the
  // navbar is portaled into an <iframe>, so the JS global `window` is the parent
  // frame and never receives the iframe's scroll — leaving the nav stuck in its
  // un-scrolled (tall, full-logo) state. Resolving the scroller via ownerDocument
  // makes the scrolled/compact state work identically in preview and on the live site.
  useEffect(() => {
    const node = headerRef.current;
    const doc = node?.ownerDocument ?? document;
    const win = doc.defaultView ?? window;
    const scroller: HTMLElement | null = doc.scrollingElement as HTMLElement | null;
    const on = () => {
      const y = win.scrollY || scroller?.scrollTop || 0;
      setScrolled(y > 60);
    };
    on();
    win.addEventListener("scroll", on, { passive: true });
    return () => win.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const iconLogo = app.branding?.logo;
  const fullLogo = app.branding?.logoFull ?? iconLogo;
  const links = app.layout?.nav?.links ?? [];
  const ctas = app.layout?.nav?.ctas ?? [];

  const closeMenu = () => setMenuOpen(false);

  /**
   * Smooth-scroll to an in-page anchor (`/#id` or `#id`) within THIS link's own
   * document, instead of letting the browser do a cross-document navigation. Works
   * on the live site AND inside the builder preview iframe (where `/#id` would
   * otherwise resolve against the <base href> and navigate away). Non-hash links
   * fall through to normal navigation.
   */
  const onNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const win = e.currentTarget.ownerDocument.defaultView;
    const inPreview = !!win && win.parent !== win;

    // A legal-page link clicked inside the preview iframe: tell the builder to show
    // that authored page instead of navigating to the live `(site)` route.
    const section = legalSectionForHref(href);
    if (section && inPreview) {
      e.preventDefault();
      win.parent.postMessage({ type: WB_LEGAL_NAV_MSG, section }, "*");
      closeMenu();
      return;
    }

    const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
    if (!hash) return; // not an in-page anchor — let it navigate normally
    const doc = e.currentTarget.ownerDocument;
    const target = doc.getElementById(hash);
    if (!target) return; // anchor not on this page — let it navigate normally
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMenu();
  };

  return (
    <>
      <header ref={headerRef} className={"nav" + (scrolled ? " is-scrolled" : "")}>
        <Link href="/" className="nav__brand" onClick={onNavClick("#top")}>
          {fullLogo && (
            <Image
              src={fullLogo}
              alt={app.tenant.name}
              width={200}
              height={64}
              className="nav__logo-full"
              priority
            />
          )}
          {iconLogo && (
            <Image
              src={iconLogo}
              alt={app.tenant.name}
              width={40}
              height={40}
              className="nav__mark"
            />
          )}
          {!fullLogo && !iconLogo && (
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              {app.tenant.name}
            </span>
          )}
        </Link>

        {links.length > 0 && (
          <nav className="nav__links">
            {links.map((l, i) => (
              <Link key={i} href={safeHref(l.href)} onClick={onNavClick(safeHref(l.href))}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        {ctas.length > 0 && (
          <div className="nav__cta">
            {ctas.map((c, i) => (
              <Link
                key={i}
                href={safeHref(c.href)}
                className={ctaClass(c.variant)}
                style={{
                  padding: c.variant === "primary" ? "10px 18px" : "10px 16px",
                }}
                {...(c.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}

        {(links.length > 0 || ctas.length > 0) && (
          <button
            className={"nav__hamburger" + (menuOpen ? " is-open" : "")}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </header>

      <div
        className={"nav__mobile-menu" + (menuOpen ? " is-open" : "")}
        aria-hidden={!menuOpen}
      >
        {links.map((l, i) => (
          <Link key={i} href={safeHref(l.href)} onClick={onNavClick(safeHref(l.href))}>
            {l.label}
          </Link>
        ))}
        {ctas.length > 0 && (
          <div className="nav__mobile-cta">
            {ctas.map((c, i) => (
              <Link
                key={i}
                href={safeHref(c.href)}
                className={ctaClass(c.variant)}
                onClick={closeMenu}
                {...(c.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
