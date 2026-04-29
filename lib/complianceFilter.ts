import type {
  AppConfig,
  Section,
  SectionType,
  SystemConfig,
} from "@/types/config.types";

function isUnsafeLabel(label: string, unsafeList: string[]): boolean {
  const normalized = label.trim().toLowerCase();
  return unsafeList.some((u) => u.trim().toLowerCase() === normalized);
}

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

function isAllowedSection(
  section: Section,
  allowlist: SectionType[],
): boolean {
  return allowlist.includes(section.type);
}

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
