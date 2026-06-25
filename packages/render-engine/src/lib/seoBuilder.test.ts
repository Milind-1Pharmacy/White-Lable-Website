/**
 * @file seoBuilder.test.ts
 * @description Tests for metadata generation: canonical-URL correctness, the
 *  tenant-siteUrl → env fallback, and the safeSrc guard on the OG image (an unsafe
 *  ogImage must not reach the meta tags).
 */
import { describe, it, expect } from "vitest";
import { buildMetadata, resolveSiteUrl } from "./seoBuilder";
import type { ResolvedConfig } from "@wl/config-types";

/** Minimal ResolvedConfig fixture — only the fields seoBuilder reads. */
function fixture(overrides: Record<string, unknown> = {}): ResolvedConfig {
  return {
    app: {
      tenant: { name: "Acme", category: "Shop" },
      seo: {
        title: "Acme — best shop",
        description: "We sell things.",
        keywords: ["a", "b"],
        siteUrl: "https://acme.com",
        ...(overrides.seo as object),
      },
      branding: { colors: {} },
      contact: {},
      ...overrides,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    system: {} as any,
  };
}

describe("resolveSiteUrl", () => {
  it("prefers tenant seo.siteUrl and strips trailing slash", () => {
    expect(resolveSiteUrl(fixture({ seo: { siteUrl: "https://acme.com/" } }).app)).toBe(
      "https://acme.com",
    );
  });
  it("falls back when siteUrl is blank", () => {
    const url = resolveSiteUrl(fixture({ seo: { siteUrl: "" } }).app);
    expect(url).toMatch(/^https?:\/\//);
  });
});

describe("buildMetadata", () => {
  it("emits a per-page canonical from siteUrl + path", () => {
    const meta = buildMetadata(fixture(), "Privacy Policy", "/privacy-policy");
    expect(meta.alternates?.canonical).toBe("https://acme.com/privacy-policy");
    expect(meta.title).toBe("Privacy Policy | Acme");
  });

  it("homepage canonical is the root", () => {
    const meta = buildMetadata(fixture());
    expect(meta.alternates?.canonical).toBe("https://acme.com/");
  });

  it("sets index/follow robots", () => {
    const meta = buildMetadata(fixture());
    // robots is an object with index/follow true
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });

  it("passes a safe ogImage through to OG + twitter", () => {
    const meta = buildMetadata(fixture({ seo: { siteUrl: "https://acme.com", ogImage: "https://cdn.acme.com/og.png" } }));
    const og = meta.openGraph as { images?: Array<{ url: string }> };
    expect(og.images?.[0].url).toBe("https://cdn.acme.com/og.png");
  });

  it("DROPS an unsafe ogImage (javascript:) from the metadata", () => {
    const meta = buildMetadata(fixture({ seo: { siteUrl: "https://acme.com", ogImage: "javascript:alert(1)" } }));
    const og = meta.openGraph as { images?: unknown };
    expect(og.images).toBeUndefined();
    const tw = meta.twitter as { images?: unknown };
    expect(tw.images).toBeUndefined();
  });
});
