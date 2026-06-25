/**
 * @file imageSpecs.test.ts
 * @description Tests the per-slot image guidance. One image serves BOTH desktop
 *  and mobile (cropped to different ratios per device), so the check warns ONLY on
 *  low resolution or extreme orientation — normal portraits/landscapes pass. This
 *  guards against the false-positive bug where correctly-sized tenant images warned.
 */
import { describe, it, expect } from "vitest";
import { imageHint, checkImageRatio, IMAGE_SPECS } from "./validationSchema";

describe("imageHint", () => {
  it("frames guidance for a single cross-device image", () => {
    const h = imageHint("hero");
    expect(h).toMatch(/Portrait/);
    expect(h).toMatch(/1200×1600/);
    expect(h).toMatch(/centred/);
  });
  it("returns undefined for unknown / missing slot", () => {
    expect(imageHint("nope")).toBeUndefined();
    expect(imageHint(undefined)).toBeUndefined();
  });
  it("every spec id produces a usable hint", () => {
    for (const id of Object.keys(IMAGE_SPECS)) {
      expect(imageHint(id)).toBeTruthy();
    }
  });
});

describe("checkImageRatio — passes the real tenant images", () => {
  it("a 1024×1536 (2:3) portrait passes the hero slot (the reported false positive)", () => {
    expect(checkImageRatio("hero", 1024, 1536)).toBeNull();
  });
  it("a 4:5 portrait also passes hero", () => {
    expect(checkImageRatio("hero", 1200, 1500)).toBeNull();
  });
  it("a 16:9 landscape passes the gallery slot", () => {
    expect(checkImageRatio("gallery", 1600, 900)).toBeNull();
  });
  it("a square logo passes", () => {
    expect(checkImageRatio("logo", 512, 512)).toBeNull();
  });
});

describe("checkImageRatio — still catches genuinely bad images", () => {
  it("warns on low resolution", () => {
    const w = checkImageRatio("hero", 400, 600);
    expect(w).toMatch(/at least/);
  });
  it("warns on an extreme panorama into a portrait slot", () => {
    const w = checkImageRatio("hero", 3000, 800); // 3.75 ratio, way past portrait max
    expect(w).toMatch(/very wide/);
  });
  it("warns on a super-tall image into a landscape slot", () => {
    // High-res (passes the minW check) but 0.375 ratio — below the landscape min.
    const w = checkImageRatio("gallery", 1200, 3200);
    expect(w).toMatch(/very tall/);
  });
  it("no warning for unknown slot or undecodable (SVG / 0×0)", () => {
    expect(checkImageRatio("nope", 100, 100)).toBeNull();
    expect(checkImageRatio("hero", 0, 0)).toBeNull();
  });
});
