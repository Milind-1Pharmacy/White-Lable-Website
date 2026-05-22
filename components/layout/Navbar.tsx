"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AppConfig, NavCta } from "@/types/config.types";

type NavbarProps = {
  app: AppConfig;
};

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

export function Navbar({ app }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
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

  return (
    <>
      <header className={"nav" + (scrolled ? " is-scrolled" : "")}>
        <Link href="/" className="nav__brand" onClick={closeMenu}>
          {fullLogo && (
            <Image
              src={fullLogo}
              alt={app.tenant.name}
              width={198}
              height={100}
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
            {links.map((l) => (
              <Link key={l.label} href={l.href}>
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
                href={c.href}
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
        {links.map((l) => (
          <Link key={l.label} href={l.href} onClick={closeMenu}>
            {l.label}
          </Link>
        ))}
        {ctas.length > 0 && (
          <div className="nav__mobile-cta">
            {ctas.map((c, i) => (
              <Link
                key={i}
                href={c.href}
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
