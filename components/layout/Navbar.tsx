"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AppConfig } from "@/types/config.types";

type NavbarProps = {
  app: AppConfig;
};

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Fulfilment", href: "/services" },
  { label: "Team", href: "/about" },
  { label: "FAQ", href: "/contact" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({ app }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const iconLogo = app.branding?.logo;
  const fullLogo = app.branding?.logoFull ?? iconLogo;

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={"nav" + (scrolled ? " is-scrolled" : "")}>
        <Link href="/" className="nav__brand" onClick={closeMenu}>
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

        <nav className="nav__links">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav__cta">
          <Link
            href="/contact"
            className="btn btn-ghost"
            style={{ padding: "10px 16px" }}
          >
            Get the app
          </Link>
          <Link
            href="/contact"
            className="btn btn-primary"
            style={{ padding: "10px 18px" }}
          >
            Order now →
          </Link>
        </div>

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
      </header>

      {/* Mobile slide-in menu */}
      <div
        className={"nav__mobile-menu" + (menuOpen ? " is-open" : "")}
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((l) => (
          <Link key={l.label} href={l.href} onClick={closeMenu}>
            {l.label}
          </Link>
        ))}
        <div className="nav__mobile-cta">
          <Link href="/contact" className="btn btn-ghost" onClick={closeMenu}>
            Get the app
          </Link>
          <Link href="/contact" className="btn btn-primary" onClick={closeMenu}>
            Order now →
          </Link>
        </div>
      </div>
    </>
  );
}
