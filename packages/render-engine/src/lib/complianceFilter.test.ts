/**
 * @file complianceFilter.test.ts
 * @description Tests the compliance invariants that MUST hold before any render:
 *  unsafe CTA labels rewritten, payments/cart force-disabled, disallowed sections
 *  stripped, and a disclaimer always present (tenant value or system default).
 */
import { describe, it, expect } from "vitest";
import { applyCompliance } from "./complianceFilter";
import type { AppConfig, SystemConfig } from "@wl/config-types";

const system = {
  sectionAllowlist: ["hero", "about", "services"],
  compliance: {
    unsafeCtaLabels: ["buy now", "order"],
    forceDisabledFeatures: ["enablePayments", "enableCart"],
    defaultDisclaimer: "System default disclaimer.",
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any as SystemConfig;

function app(overrides: Record<string, unknown> = {}): AppConfig {
  return {
    tenant: { name: "Acme", category: "Shop" },
    content: {
      hero: { cta: { label: "Buy Now", type: "safe-action" } },
      sections: [
        { type: "hero", data: {} },
        { type: "services", data: {} },
        { type: "evilSection", data: {} },
      ],
      ...(overrides.content as object),
    },
    features: { enablePayments: true, enableCart: true, enableChat: true, enableForms: true },
    compliance: { mode: "business-profile-safe", disclaimer: "" },
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("applyCompliance", () => {
  it("rewrites an unsafe hero CTA label", () => {
    const out = applyCompliance(app(), system);
    expect(out.content.hero.cta.label.toLowerCase()).not.toBe("buy now");
  });

  it("force-disables payments and cart regardless of config", () => {
    const out = applyCompliance(app(), system);
    expect(out.features.enablePayments).toBe(false);
    expect(out.features.enableCart).toBe(false);
  });

  it("strips sections not on the allowlist", () => {
    const out = applyCompliance(app(), system);
    const types = (out.content.sections ?? []).map((s) => s.type);
    expect(types).not.toContain("evilSection");
    expect(types).toContain("hero");
  });

  it("falls back to the system disclaimer when the tenant supplies none", () => {
    const out = applyCompliance(app(), system);
    expect(out.compliance.disclaimer).toBe("System default disclaimer.");
  });

  it("keeps a tenant disclaimer when present", () => {
    const out = applyCompliance(app({ compliance: { mode: "business-profile-safe", disclaimer: "Mine." } }), system);
    expect(out.compliance.disclaimer).toBe("Mine.");
  });

  it("does not crash on a config missing hero (partial-config invariant)", () => {
    // A config whose content omits `hero` entirely must degrade, not throw.
    const partial = { content: { sections: [] } };
    expect(() => applyCompliance(app(partial), system)).not.toThrow();
    const out = applyCompliance(app(partial), system);
    // The synthesised CTA still gets a safe label rather than crashing.
    expect(out.content.hero.cta.label).toBeTruthy();
  });

  it("does not crash when content is entirely absent", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bare = { tenant: { name: "X", category: "Y" }, features: {} } as any;
    expect(() => applyCompliance(bare, system)).not.toThrow();
  });
});
