"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StickyCtaConfig } from "@/types/config.types";

type StickyCtaProps = {
  config?: StickyCtaConfig;
};

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
        href={config.ctaHref ?? "#app"}
        className="btn btn-accent"
        style={{ padding: "8px 14px", fontSize: 13 }}
      >
        {config.ctaLabel}
      </Link>
    </div>
  );
}
