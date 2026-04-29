"use client";

import Link from "next/link";

import { Container } from "@/components/layout/Container";
import type { AppConfig } from "@/types/config.types";

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

type FooterProps = {
  app: AppConfig;
};

export function Footer({ app }: FooterProps) {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-[var(--brand-primary)]/15">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--brand-secondary) 12%, transparent))",
        }}
      />
      <Container className="py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-5">
            <p className="font-display text-3xl font-light tracking-tight text-[var(--brand-text)] sm:text-4xl">
              {app.tenant.name}
            </p>
            {app.contact?.address ? (
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--brand-text)]/65">
                {app.contact.address}
              </p>
            ) : null}
            <button
              type="button"
              onClick={scrollToTop}
              className="group mt-8 inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-text)]/65 transition-colors duration-300 hover:text-[var(--brand-text)]"
            >
              <span
                aria-hidden
                className="inline-block translate-y-0 transition-transform duration-300 group-hover:-translate-y-1"
              >
                ↑
              </span>
              Back to top
            </button>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--brand-text)]/70 transition-colors duration-300 hover:text-[var(--brand-text)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[var(--brand-text)]/70">
              {app.contact?.email ? (
                <li>
                  <a
                    href={`mailto:${app.contact.email}`}
                    className="transition-colors duration-300 hover:text-[var(--brand-text)]"
                  >
                    {app.contact.email}
                  </a>
                </li>
              ) : null}
              {app.contact?.phone ? (
                <li>
                  <a
                    href={`tel:${app.contact.phone.replace(/\s+/g, "")}`}
                    className="transition-colors duration-300 hover:text-[var(--brand-text)]"
                  >
                    {app.contact.phone}
                  </a>
                </li>
              ) : null}
              <li className="pt-2 text-[11px] uppercase tracking-[0.22em] text-[var(--brand-text)]/50">
                Mon–Sat · 6 AM – 9 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-black/5 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--brand-text)]/55">
            © {year} {app.tenant.name}. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--brand-text)]/55 transition-colors duration-300 hover:text-[var(--brand-text)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-8 max-w-3xl text-[11px] leading-relaxed text-[var(--brand-text)]/45">
          {app.compliance.disclaimer}
        </p>
      </Container>
    </footer>
  );
}
