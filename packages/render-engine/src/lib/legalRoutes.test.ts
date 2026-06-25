/**
 * @file legalRoutes.test.ts
 * @description Tests for the legal-route ↔ builder-section mapping + the
 *  postMessage narrowing used by the preview-iframe legal-nav bridge.
 */
import { describe, it, expect } from "vitest";
import {
  legalSectionForHref,
  isLegalNavMessage,
  WB_LEGAL_NAV_MSG,
} from "./legalRoutes";

describe("legalSectionForHref", () => {
  it("maps known legal routes (with/without trailing slash, query, hash)", () => {
    expect(legalSectionForHref("/privacy-policy")).toBe("privacy");
    expect(legalSectionForHref("/privacy-policy/")).toBe("privacy");
    expect(legalSectionForHref("/terms-conditions")).toBe("terms");
    expect(legalSectionForHref("/disclaimer")).toBe("disclaimer");
    expect(legalSectionForHref("/deactivate-account")).toBe("dataDeletion");
    expect(legalSectionForHref("/contact")).toBe("contact");
    expect(legalSectionForHref("/privacy-policy?x=1#top")).toBe("privacy");
  });

  it("returns null for non-legal, external, and anchor hrefs", () => {
    expect(legalSectionForHref("/about")).toBeNull();
    expect(legalSectionForHref("#faq")).toBeNull();
    expect(legalSectionForHref("https://example.com/privacy-policy")).toBeNull();
    expect(legalSectionForHref("")).toBeNull();
  });
});

describe("isLegalNavMessage", () => {
  it("accepts a well-formed message", () => {
    expect(isLegalNavMessage({ type: WB_LEGAL_NAV_MSG, section: "privacy" })).toBe(true);
  });

  it("rejects malformed / foreign messages", () => {
    expect(isLegalNavMessage({ type: "other", section: "privacy" })).toBe(false);
    expect(isLegalNavMessage({ type: WB_LEGAL_NAV_MSG })).toBe(false);
    expect(isLegalNavMessage(null)).toBe(false);
    expect(isLegalNavMessage("string")).toBe(false);
    expect(isLegalNavMessage(undefined)).toBe(false);
  });
});
