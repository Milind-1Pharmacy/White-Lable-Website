/**
 * @file sectionTemplates.test.ts
 * @description Guards the "Let AI write it" generators: every template string must
 *  fit its validation cap (TEXT_LIMITS via SECTION_RULES) so a filled section is
 *  publish-valid, and no template may leak tenant-specific assets (urmedz/aarav
 *  paths or hardcoded regions). This is the safety net for the AI-fill feature.
 */
import { describe, it, expect } from "vitest";
import {
  templateInfoFromConfig,
  seoTemplate,
  heroTemplate,
  aboutTemplate,
  servicesTemplate,
  sectionTemplate,
  sectionDataTemplates,
} from "./sectionTemplates";
import { TEXT_LIMITS, SECTION_RULES } from "./validationSchema";

const INFO = { name: "1Pharmacy", category: "Pharmacy & Wellness", email: "", phone: "", address: "" };

/** Assert a string is within a TEXT_LIMITS id's [min,max]. */
function withinLimit(value: string, limitId: keyof typeof TEXT_LIMITS, where: string) {
  const lim = TEXT_LIMITS[limitId] as { max: number; min?: number };
  expect(value.length, `${where} too long (${value.length}>${lim.max})`).toBeLessThanOrEqual(lim.max);
  if (lim.min != null && value.length > 0) {
    expect(value.length, `${where} too short (${value.length}<${lim.min})`).toBeGreaterThanOrEqual(lim.min);
  }
}

/** Walk a section's data against its SECTION_RULES textFields + itemTextFields. */
function assertSectionFits(type: string, data: Record<string, unknown>) {
  const rule = SECTION_RULES[type];
  if (!rule) return;
  for (const [key, limitId] of Object.entries(rule.textFields ?? {})) {
    const v = data[key];
    if (typeof v === "string") withinLimit(v, limitId as keyof typeof TEXT_LIMITS, `${type}.${key}`);
  }
  for (const [arrKey, cols] of Object.entries(rule.itemTextFields ?? {})) {
    const arr = data[arrKey];
    if (!Array.isArray(arr)) continue;
    arr.forEach((item, idx) => {
      for (const [col, limitId] of Object.entries(cols as Record<string, string>)) {
        const v = (item as Record<string, unknown>)[col];
        if (typeof v === "string") withinLimit(v, limitId as keyof typeof TEXT_LIMITS, `${type}.${arrKey}[${idx}].${col}`);
      }
    });
    // Array count within max.
    const arrRule = rule.arrays?.[arrKey];
    if (arrRule?.max != null) expect(arr.length, `${type}.${arrKey} over max`).toBeLessThanOrEqual(arrRule.max);
    if (arrRule?.min != null) expect(arr.length, `${type}.${arrKey} under min`).toBeGreaterThanOrEqual(arrRule.min);
  }
}

describe("templateInfoFromConfig", () => {
  it("pulls name/category with fallbacks", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(templateInfoFromConfig({ tenant: { name: "Acme", category: "Shop" } } as any).name).toBe("Acme");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(templateInfoFromConfig({} as any).name).toBe("our business");
  });
});

describe("core templates fit their caps", () => {
  it("seoTemplate", () => {
    const s = seoTemplate(INFO);
    withinLimit(s.title, "seoTitle", "seo.title");
    withinLimit(s.description, "seoDescription", "seo.description");
    expect(s.keywords.length).toBeGreaterThan(0);
  });
  it("heroTemplate", () => {
    const h = heroTemplate(INFO);
    assertSectionFits("hero", h);
    withinLimit(h.tagline, "sectionSubtitle", "hero.tagline");
  });
  it("aboutTemplate", () => {
    const a = aboutTemplate(INFO);
    assertSectionFits("about", a);
  });
  it("servicesTemplate produces 4 cards within caps", () => {
    const sv = servicesTemplate();
    expect(sv.items.length).toBe(4);
    sv.items.forEach((it: { title: string; description: string }, i: number) => {
      withinLimit(it.title, "cardTitle", `service[${i}].title`);
      withinLimit(it.description, "cardDescription", `service[${i}].description`);
    });
  });
});

describe("every dynamic section template fits SECTION_RULES", () => {
  for (const type of Object.keys(sectionDataTemplates)) {
    it(`${type} fits its caps`, () => {
      const data = sectionTemplate(type) as Record<string, unknown>;
      expect(data).toBeTruthy();
      assertSectionFits(type, data);
    });
  }
});

describe("no tenant-specific asset leakage", () => {
  it("templates contain no urmedz/aarav paths or hardcoded regions", () => {
    const all = JSON.stringify([
      seoTemplate(INFO), heroTemplate(INFO), aboutTemplate(INFO), servicesTemplate(),
      ...Object.keys(sectionDataTemplates).map((t) => sectionTemplate(t)),
    ]);
    expect(all).not.toMatch(/urmedz|aarav_pharmacy|South India|Bengaluru|Hyderabad/i);
  });
  it("image slots are empty (user uploads)", () => {
    const hero = heroTemplate(INFO);
    expect(hero.image).toBe("");
    const gallery = sectionTemplate("gallery") as { images: Array<{ src: string }> };
    gallery.images.forEach((im) => expect(im.src).toBe(""));
  });
});
