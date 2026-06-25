/**
 * @file StickyCta.tsx
 * @description Scroll-aware sticky call-to-action bar linking to the app.
 * @responsibilities
 *  - Show the bar only in the mid-scroll range of the page.
 *  - Render nothing when disabled or missing text/label.
 *  - Link to a config CTA href (non-transactional).
 * @dependencies React hooks, next/link, StickyCtaConfig type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StickyCtaConfig } from "@wl/config-types";
import { safeHref } from "@/lib/safeUrl";

type StickyCtaProps = {
  config?: StickyCtaConfig;
};

/**
 * StickyCta - Floating CTA bar shown while scrolling the page body.
 * @props {StickyCtaConfig} [config] - CTA text, label, and target href
 * @returns JSX element or null
 */
export function StickyCta({ config }: StickyCtaProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setShow(y > 600 && y < h - 600);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (!config?.enabled || !config.text || !config.ctaLabel) return null;

  return (
    <div className={"cta-bar" + (show ? "" : " is-hidden")}>
      <span className="pulse" style={{ background: "var(--accent)" }} />
      <span style={{ opacity: 0.85 }}>{config.text}</span>
      <Link
        href={safeHref(config.ctaHref, "#app")}
        className="btn btn-accent"
        style={{ padding: "8px 14px", fontSize: 13 }}
      >
        {config.ctaLabel}
      </Link>
    </div>
  );
}
