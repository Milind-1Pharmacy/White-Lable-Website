# Motion

The GSAP + ScrollTrigger animation system in `lib/motion.ts`, its presets, and the hard rules that keep animations robust across HMR, Strict Mode, and reduced-motion.

## Setup

`lib/motion.ts` registers ScrollTrigger **at module load** (not in a `useEffect`):

```ts
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
```

Registering at load avoids modules racing the provider mount and logging "Missing plugin?". `MotionProvider` (`components/motion/MotionProvider.tsx`) wraps the app in the root layout. Client modules use `gsap.context()` for scoped cleanup.

`REDUCED_MOTION` is computed once from `prefers-reduced-motion: reduce`. Every preset checks it first and bails to `null`, leaving elements at their natural (visible) state.

## Presets

| Preset | Effect | Notes |
| --- | --- | --- |
| `fadeUp(target, opts)` | Fade + slide up on scroll into view | `gsap.from`; `clearProps`; `start: "top 95%"`; `once` |
| `staggerCards(targets, opts)` | Group fade/slide up in sequence | `gsap.from`; default stagger 0.08 |
| `parallaxImage(target, opts)` | Scrubbed vertical parallax tied to scroll | `gsap.fromTo` (scrub-only, see below) |
| `imageReveal(target, opts)` | Clip-path wipe reveal | `gsap.from`; `clearProps: "clipPath"` |
| `revealSplitWords(el, opts)` | Per-word masked slide-up | uses `splitLines()` to wrap words |
| `splitLines(el)` | Wraps each word in masked spans | DOM helper for word reveals |

All entry presets return `null` under reduced motion. `revealSplitWords` additionally resets the split words to their natural transform when reduced motion is on.

## Hard rules

These are non-negotiable for entry animations (see project `CLAUDE.md` and `lib/motion.ts`):

- **Use `gsap.from()`, never `gsap.fromTo()` for entry animations.** If the trigger never fires (HMR, Strict Mode, fast scroll), content stays at its natural visible state. `fromTo` would lock the invisible "from" state. The one exception is `parallaxImage`, which uses `fromTo` deliberately because it is a continuous scrubbed effect, not an entry reveal.
- **Always set `clearProps`** (`"transform,opacity"`, or `"clipPath"` for reveals) so GSAP wipes inline styles after completion — prevents stale state across HMR.
- **Use `start: "top 95%"`** for entry triggers (not 80%), so above-the-fold content fires immediately. Entry triggers also use `toggleActions: "play none none none"` and `once: true`.
- **Parallaxed inner image refs need `-inset-[6%]` overscan**, not `inset-0`. GSAP `yPercent` translation otherwise reveals blank wrapper edges. See `modules/Hero.tsx`, `modules/About.tsx`, `modules/Gallery.tsx`.
- **Don't stack CSS `scale-[1.x]` on an element GSAP transforms.** Use `-inset-[N%]` (layout overscan) instead.
- **Register ScrollTrigger at module load**, not in an effect (done in `lib/motion.ts`).
- **Honor `prefers-reduced-motion`** via the `REDUCED_MOTION` constant — presets bail to `null`.

## Lenis (removed)

Smooth-scroll via Lenis was tried and removed — it conflicts with sticky headers and breaks scroll. `scroll-behavior: smooth` on `html` is sufficient. Do not reintroduce it.
