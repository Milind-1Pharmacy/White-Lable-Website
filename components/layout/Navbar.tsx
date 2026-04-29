"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/ui.types";
import type { AppConfig } from "@/types/config.types";

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

type NavbarProps = {
  app: AppConfig;
};

export function Navbar({ app }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        scrolled
          ? "border-b border-[var(--brand-primary)]/15 bg-[var(--brand-background)]/85 backdrop-blur-xl"
          : "border-b border-transparent bg-[var(--brand-background)]/70 backdrop-blur-md",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between transition-[height,padding] duration-500",
          scrolled ? "h-16" : "h-20 sm:h-24",
        )}
      >
        <Link href="/" className="group flex items-center gap-3 sm:gap-4">
          {app.branding?.logo ? (
            <span
              className={cn(
                "relative inline-flex items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5 transition-all duration-500 group-hover:rotate-[8deg]",
                scrolled ? "h-9 w-9" : "h-11 w-11",
              )}
            >
              <Image
                src={app.branding.logo}
                alt={`${app.tenant.name} logo`}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </span>
          ) : (
            <span
              aria-hidden
              className={cn(
                "inline-block rounded-full transition-all duration-500 group-hover:rotate-[8deg]",
                scrolled ? "h-9 w-9" : "h-11 w-11",
              )}
              style={{ background: "var(--brand-primary)" }}
            />
          )}
          <span
            className={cn(
              "font-display font-light tracking-tight text-[var(--brand-text)] transition-all duration-500",
              scrolled ? "text-base sm:text-lg" : "text-lg sm:text-2xl",
            )}
          >
            {app.tenant.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative font-medium text-[var(--brand-text)]/70 transition-colors duration-300 hover:text-[var(--brand-text)]"
            >
              <span>{item.label}</span>
              <span
                aria-hidden
                className="absolute -bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-[var(--brand-primary)] transition-all duration-300 group-hover:w-full"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "sm" }),
              "group hidden h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-xs font-medium tracking-wide text-white shadow-sm transition-all duration-300 hover:bg-[var(--brand-accent)] hover:shadow-md sm:inline-flex",
            )}
          >
            <span>Visit Studio</span>
            <span
              aria-hidden
              className="inline-block translate-x-0 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
