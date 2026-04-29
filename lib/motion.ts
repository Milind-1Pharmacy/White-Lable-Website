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

export function registerGsap() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
