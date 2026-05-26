/**
 * @file complianceFilter.ts
 * @description Sanitizes tenant config to meet business-profile-safe rules.
 * @responsibilities
 *  - Rewrite unsafe CTA labels to safe fallbacks.
 *  - Force-disable banned features and filter sections by allowlist.
 *  - Guarantee a footer disclaimer on every page.
 * @dependencies @/types/config.types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type {
  AppConfig,
  Section,
  SectionType,
  SystemConfig,
} from "@/types/config.types";

/**
 * isUnsafeLabel - Checks if a CTA label matches the banned list.
 * @param {string} label - The CTA label to test.
 * @param {string[]} unsafeList - Disallowed labels from system config.
 * @returns True when the label is unsafe.
 */
function isUnsafeLabel(label: string, unsafeList: string[]): boolean {
  const normalized = label.trim().toLowerCase();
  return unsafeList.some((u) => u.trim().toLowerCase() === normalized);
}

/**
 * sanitizeCta - Returns a safe CTA label, swapping unsafe ones for a fallback.
 * @param {string|undefined} label - The configured CTA label.
 * @param {SystemConfig} system - Holds the fallback and unsafe list.
 * @returns A compliant CTA label.
 */
function sanitizeCta(
  label: string | undefined,
  system: SystemConfig,
): string {
  const fallback = system.compliance.safeCtaFallback || "Learn More";
  if (!label || !label.trim()) return fallback;
  return isUnsafeLabel(label, system.compliance.unsafeCtaLabels)
    ? fallback
    : label;
}

/**
 * isAllowedSection - Checks if a section type is on the allowlist.
 * @param {Section} section - The section to test.
 * @param {SectionType[]} allowlist - Permitted section types.
 * @returns True when the section may render.
 */
function isAllowedSection(
  section: Section,
  allowlist: SectionType[],
): boolean {
  return allowlist.includes(section.type);
}

/**
 * applyCompliance - Returns a config rewritten to satisfy all compliance rules.
 * @param {AppConfig} app - The raw tenant config.
 * @param {SystemConfig} system - The compliance ruleset and defaults.
 * @returns A sanitized config safe to render.
 */
export function applyCompliance(
  app: AppConfig,
  system: SystemConfig,
): AppConfig {
  const sanitizedHeroCta = {
    ...app.content.hero.cta,
    label: sanitizeCta(app.content.hero.cta?.label, system),
    type: "safe-action" as const,
  };

  const allowlist = system.sectionAllowlist;
  const filteredSections = (app.content.sections ?? []).filter((s) =>
    isAllowedSection(s, allowlist),
  );

  const features = { ...app.features };
  for (const flag of system.compliance.forceDisabledFeatures) {
    features[flag] = false;
  }

  const disclaimer =
    app.compliance?.disclaimer?.trim() ||
    system.compliance.defaultDisclaimer;

  return {
    ...app,
    content: {
      ...app.content,
      hero: { ...app.content.hero, cta: sanitizedHeroCta },
      sections: filteredSections,
    },
    features,
    compliance: {
      mode: "business-profile-safe",
      disclaimer,
    },
  };
}
