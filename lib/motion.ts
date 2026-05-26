/**
 * @file motion.ts
 * @description GSAP + ScrollTrigger animation primitives for client modules.
 * @responsibilities
 *  - Register ScrollTrigger at module load.
 *  - Provide entry presets (fadeUp, staggerCards, imageReveal, parallax).
 *  - Honor prefers-reduced-motion by bailing to natural state.
 * @dependencies gsap, gsap/ScrollTrigger
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Target = gsap.TweenTarget;

// ==============================
//  ENTRY ANIMATION PRESETS
// ==============================

/**
 * fadeUp - Fades and slides a target up on scroll into view.
 * @param {Target} target - Element(s) to animate.
 * @param {object} opts - delay, y offset, duration, trigger element.
 * @returns The GSAP tween, or null when reduced motion is on.
 */
export function fadeUp(
  target: Target,
  opts: { delay?: number; y?: number; duration?: number; trigger?: Element | null } = {},
) {
  if (REDUCED_MOTION) return null;
  const { delay = 0, y = 32, duration = 0.9, trigger } = opts;
  return gsap.from(target, {
    y,
    opacity: 0,
    duration,
    delay,
    ease: "power3.out",
    clearProps: "transform,opacity",
    ...(trigger
      ? {
          scrollTrigger: {
            trigger,
            start: "top 95%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      : {}),
  });
}

/**
 * staggerCards - Fades and slides a group of items up in sequence.
 * @param {Target} targets - The elements to stagger.
 * @param {object} opts - stagger gap, trigger element, y offset.
 * @returns The GSAP tween, or null when reduced motion is on.
 */
export function staggerCards(
  targets: Target,
  opts: { stagger?: number; trigger?: Element | null; y?: number } = {},
) {
  if (REDUCED_MOTION) return null;
  const { stagger = 0.08, trigger, y = 28 } = opts;
  return gsap.from(targets, {
    y,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger,
    clearProps: "transform,opacity",
    ...(trigger
      ? {
          scrollTrigger: {
            trigger,
            start: "top 95%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      : {}),
  });
}

/**
 * parallaxImage - Scrubs a vertical parallax shift tied to scroll.
 * @param {Target} target - The image element to translate.
 * @param {object} opts - trigger element and travel distance.
 * @returns The GSAP tween, or null when reduced motion is on.
 */
export function parallaxImage(
  target: Target,
  opts: { trigger?: Element | null; distance?: number } = {},
) {
  if (REDUCED_MOTION) return null;
  const { trigger, distance = 80 } = opts;
  const offset = distance / 10;
  return gsap.fromTo(
    target,
    { yPercent: -offset },
    {
      yPercent: offset,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: trigger ?? (target as Element),
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    },
  );
}

/**
 * imageReveal - Unmasks an image with a clip-path wipe on scroll.
 * @param {Target} target - The element to reveal.
 * @param {object} opts - trigger element.
 * @returns The GSAP tween, or null when reduced motion is on.
 */
export function imageReveal(
  target: Target,
  opts: { trigger?: Element | null } = {},
) {
  if (REDUCED_MOTION) return null;
  const { trigger } = opts;
  return gsap.from(target, {
    clipPath: "inset(100% 0 0 0)",
    duration: 1.2,
    ease: "power3.out",
    clearProps: "clipPath",
    ...(trigger
      ? {
          scrollTrigger: {
            trigger,
            start: "top 95%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      : {}),
  });
}

// ==============================
//  TEXT SPLIT HELPERS
// ==============================

/**
 * splitLines - Wraps each word in masked spans for reveal animation.
 * @param {HTMLElement} el - The text element to split in place.
 * @returns The inner word spans to animate.
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  const words = text.trim().split(/\s+/);
  el.textContent = "";
  el.style.lineHeight = el.style.lineHeight || "1.05";

  const containers: HTMLElement[] = [];
  for (const word of words) {
    const wrapper = document.createElement("span");
    wrapper.className = "inline-block overflow-hidden align-bottom";
    const inner = document.createElement("span");
    inner.className = "inline-block translate-y-[110%] will-anim";
    inner.textContent = word;
    wrapper.appendChild(inner);
    el.appendChild(wrapper);
    el.appendChild(document.createTextNode(" "));
    containers.push(inner);
  }
  return containers;
}

/**
 * revealSplitWords - Splits text and slides each word up in a stagger.
 * @param {HTMLElement} el - The text element to animate.
 * @param {object} opts - delay and per-word stagger.
 * @returns The GSAP tween, or null when reduced motion is on.
 */
export function revealSplitWords(
  el: HTMLElement,
  opts: { delay?: number; stagger?: number } = {},
) {
  if (REDUCED_MOTION) {
    el.querySelectorAll<HTMLElement>(".will-anim").forEach((c) => {
      c.style.transform = "translateY(0)";
    });
    return null;
  }
  const inners = splitLines(el);
  return gsap.to(inners, {
    yPercent: 0,
    duration: 1,
    ease: "power3.out",
    stagger: opts.stagger ?? 0.06,
    delay: opts.delay ?? 0,
  });
}

/**
 * registerGsap - Registers the ScrollTrigger plugin on the client.
 * @returns Nothing.
 */
export function registerGsap() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
