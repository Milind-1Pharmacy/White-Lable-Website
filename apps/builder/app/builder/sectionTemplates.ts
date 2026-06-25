/**
 * @file sectionTemplates.ts
 * @description The "Let AI write it" content generators. Each function returns a
 *  ready-to-use, standard content slice for one section/step, tailored to the
 *  tenant's business name. It is deterministic (no API) but presented as AI in the
 *  UI — instant, offline, free. Copy is generalised from the demo seed: brand-
 *  neutral (no tenant image paths or regions), name-interpolated, and written
 *  WITHIN the validation caps (validationSchema TEXT_LIMITS / SECTION_RULES) so a
 *  filled section is publish-valid. Image slots are left EMPTY (the user uploads;
 *  per-slot image guidance already covers what to put).
 *
 *  ► SWAP-POINT: each generator below is the single place a real LLM call would
 *    replace the static return — same signature, same output shape.
 * @dependencies @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-25
 */
import type { AppConfig } from "@wl/config-types";

/** Business facts the templates interpolate. */
export type TemplateInfo = {
  /** Business / brand name (falls back to "our business"). */
  name: string;
  /** Short category descriptor, e.g. "Pharmacy & Wellness". */
  category: string;
  email: string;
  phone: string;
  address: string;
};

/** Pull the template inputs out of the draft config, with safe fallbacks. */
export function templateInfoFromConfig(config: AppConfig): TemplateInfo {
  return {
    name: config.tenant?.name?.trim() || "our business",
    category: config.tenant?.category?.trim() || "Local business",
    email: config.contact?.email?.trim() || "",
    phone: config.contact?.phone?.trim() || "",
    address: config.contact?.address?.trim() || "",
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─────────────────────────────────────────────────────────────────────────────
// STEP-LEVEL: SEO
// ─────────────────────────────────────────────────────────────────────────────
export function seoTemplate(i: TemplateInfo): AppConfig["seo"] {
  return {
    title: `${i.name} — Trusted Medicines, Delivered Fast`,
    description: `${i.name} offers genuine, licensed medicines and everyday wellness products, dispensed by qualified pharmacists. Order online or visit your nearest store.`,
    keywords: ["pharmacy", "medicines", "wellness", "online pharmacy", "licensed pharmacists"],
    siteUrl: "",
    socialProfiles: [],
    ogImage: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE BLOCKS: hero / about / services
// ─────────────────────────────────────────────────────────────────────────────
export function heroTemplate(i: TemplateInfo): any {
  return {
    eyebrow: i.category,
    headline: "Authentic medicines, fingertip-fast.",
    headlineRich: {
      parts: [
        { text: "Authentic", br: true },
        { text: "medicines, " },
        { text: "fingertip-", emphasis: "italic" },
        { text: "fast." },
      ],
    },
    tagline: `${i.name} delivers trusted, licensed medicines and wellness essentials — to your door or your nearest store.`,
    image: "",
    cta: { label: "Learn More", type: "safe-action" },
    secondaryCta: { label: "How It Works", href: "/#services" },
    proof: ["Licensed pharmacists", "Same-day delivery", "Genuine products"],
    slides: [{ image: "", tag: "Fast delivery", caption: "Same-day to your door" }],
    meta: [
      { value: "100", suffix: "%", label: "Genuine, licensed medicines" },
      { value: "24", suffix: "/7", label: "Order online anytime" },
      { value: "1", suffix: "hr", label: "Average support reply" },
    ],
  };
}

export function aboutTemplate(i: TemplateInfo): any {
  return {
    eyebrow: "About us",
    title: { parts: [{ text: "Medicines are " }, { text: "indispensable.", emphasis: "italic", br: true }, { text: "Access", emphasis: "italic-accent" }, { text: " and " }, { text: "affordability", emphasis: "italic-accent" }, { text: " change lives." }] },
    lede: `${i.name} makes authentic medicines accessible and affordable for every household — quietly, reliably, every day.`,
    description: "Connecting patients with authentic, affordable medicines through licensed stores and trained pharmacists — accuracy and care in every order.",
    pillars: [
      { n: "01", meta: "Our mission", title: "Authentic, always", body: "Every medicine is traceable to a licensed manufacturer — no grey-market stock, ever.", accent: "#1FAFA6" },
      { n: "02", meta: "Our reach", title: "Care, nearby", body: "Stores and delivery that keep the medicine you need close at hand.", accent: "#F5A623" },
      { n: "03", meta: "Our promise", title: "Affordable by design", body: "Smart sourcing surfaces the best-value option for every prescription.", accent: "#6B3FA0" },
    ],
  };
}

export function servicesTemplate(): any {
  // Returns { items, meta } — the builder writes content.services + servicesMeta.
  return {
    items: [
      { title: "Prescription Medicines", description: "Genuine, licensed medicines dispensed accurately by qualified pharmacists.", icon: "" },
      { title: "Medicine Delivery", description: "Medicines delivered to your door — often same day, across the city.", icon: "" },
      { title: "Wellness & OTC", description: "Vitamins, supplements and everyday wellness products, quality-checked.", icon: "" },
      { title: "Health Devices", description: "Glucometers, BP monitors and home-care essentials from trusted brands.", icon: "" },
    ],
    meta: { eyebrow: "What we do", ctaLabel: "Explore all services", ctaHref: "/#services" },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC SECTIONS — one generator per type. Image slots are empty by design.
// ─────────────────────────────────────────────────────────────────────────────
export const sectionDataTemplates: Record<string, () => any> = {
  appStrip: () => ({
    logo: "",
    heading: { parts: [{ text: "Download the " }, { text: "pharmacy", emphasis: "italic-accent" }, { text: " app" }] },
    descriptor: "Authentic medicines · licensed pharmacists · doorstep delivery",
    appStoreUrl: "",
    googlePlayUrl: "",
  }),
  stats: () => ({
    eyebrow: "By the numbers",
    headline: "Built on trust and care.",
    descriptor: "A few numbers that show what we do, every day.",
    items: [
      { value: "100", suffix: "%", label: "Genuine medicines", footnote: "Licensed sources" },
      { value: "24", suffix: "/7", label: "Online ordering", footnote: "Anytime, anywhere" },
      { value: "1", suffix: "hr", label: "Avg. support reply", footnote: "We're quick" },
      { value: "1000", suffix: "+", label: "Products in stock", footnote: "Medicines, OTC, wellness" },
    ],
  }),
  savings: () => ({
    eyebrow: "Customer savings",
    heading: { parts: [{ text: "The magic of " }, { text: "brand options", emphasis: "italic-accent" }, { text: " in medicines." }] },
    lede: "Prices vary from brand to brand though the composition stays identical. We surface the best-value option for every prescription.",
    items: [
      { name: "Diabetes Tablets", cat: "Cat. 01 · Metformin 500mg", pct: 46, color: "#F5A623" },
      { name: "Blood Pressure Tablets", cat: "Cat. 02 · Amlodipine 5mg", pct: 56, color: "#1FAFA6" },
      { name: "Gastric Relief Tablets", cat: "Cat. 03 · Pantoprazole 40mg", pct: 55, color: "#6B3FA0" },
    ],
  }),
  videoFeature: () => ({
    tag: "Behind the scenes",
    heading: { parts: [{ text: "A look at " }, { text: "how we work", emphasis: "italic-accent" }, { text: "." }] },
    ctaLabel: "Watch Now",
    poster: "",
    videoUrl: "",
    marquee: ["Authentic", "Traceable", "Compliant", "Fast", "Trusted", "Licensed"],
  }),
  team: () => ({
    eyebrow: "Our team of specialists",
    logoMark: "",
    quote: { parts: [{ text: "United by a single purpose — to make healthcare " }, { text: "accessible, affordable", emphasis: "italic-accent" }, { text: " and", br: true }, { text: "trustworthy", emphasis: "italic-accent" }, { text: " for everyone." }] },
    signatureLabel: "Signed,",
    signature: "the team",
    departments: [
      { code: "01", count: 20, label: "Pharmacists", role: "Licensed dispensing", bg: "#F5A623", fg: "#1B2A5B", detail: "Every order reviewed by a registered pharmacist." },
      { code: "02", count: 8, label: "Care team", role: "Customer support", bg: "#1FAFA6", fg: "#FFFFFF", detail: "Reachable fast, with a quick first reply." },
      { code: "03", count: 12, label: "Delivery", role: "Last-mile logistics", bg: "#6B3FA0", fg: "#FFFFFF", detail: "Getting medicine to your door, reliably." },
    ],
    credentials: [{ label: "Care SLA", value: "Avg. reply < 1 hr" }],
  }),
  features: () => ({
    eyebrow: "Why choose us",
    heading: { parts: [{ text: "Care, " }, { text: "quietly", emphasis: "italic-accent" }, { text: " done right." }] },
    items: [
      { title: "Authenticity at the source", description: "Every medicine is sourced from licensed distributors and traceable to its manufacturer." },
      { title: "Care close to you", description: "Stores and delivery keep the medicine you need within easy reach." },
      { title: "Built for compliance", description: "Proper handling, traceability and audit-ready dispatch in every order." },
      { title: "Reviewed by pharmacists", description: "A qualified pharmacist checks every prescription before it's dispensed." },
    ],
  }),
  categories: () => ({
    eyebrow: "Featured categories",
    heading: { parts: [{ text: "Everything your family needs, under " }, { text: "one trusted roof.", emphasis: "italic-accent" }] },
    tagline: "From everyday medicines to baby care, wellness and health devices — explore the complete range we keep in stock for you.",
    items: [
      { title: "Medicines", icon: "", description: "Genuine prescription and over-the-counter medicines, dispensed accurately." },
      { title: "Baby Care", icon: "", description: "Baby food, diapers, gentle skincare and daily essentials for your little one." },
      { title: "Personal Care", icon: "", description: "Skincare, haircare and everyday hygiene products from trusted brands." },
      { title: "Diabetic Care", icon: "", description: "Glucometers, test strips and specialised supplies to manage diabetes." },
      { title: "Ayurvedic Products", icon: "", description: "Time-honoured ayurvedic and herbal remedies for natural wellbeing." },
      { title: "Surgical Items", icon: "", description: "Masks, gloves, dressings and accessories for care and recovery at home." },
    ],
  }),
  howItWorks: () => ({
    eyebrow: "How it works",
    heading: { parts: [{ text: "Prescription to " }, { text: "pocket", emphasis: "italic-accent" }, { text: " — in three steps." }] },
    steps: [
      { step: 1, title: "Browse or upload your prescription", description: "Search our catalogue or upload a prescription — we'll match it to authentic, in-stock medicines." },
      { step: 2, title: "A licensed pharmacist reviews your order", description: "Every prescription order is reviewed by a qualified pharmacist before it's dispensed." },
      { step: 3, title: "Delivered or ready for pickup", description: "Collect from your nearest store or get doorstep delivery — often same-day." },
    ],
  }),
  faq: () => ({
    eyebrow: "Frequently asked",
    heading: { parts: [{ text: "Questions,", br: true }, { text: "answered.", emphasis: "italic-accent" }] },
    lede: "Anything we missed? Reach out — our team replies within a working day.",
    ctaLabel: "Contact support",
    ctaHref: "/contact",
    items: [
      { question: "Where do you source your medicines from?", answer: "All medicines are sourced exclusively from licensed manufacturers and distributors. Every batch is traceable — no grey-market stock." },
      { question: "How do you handle prescriptions?", answer: "Prescription medicines are dispensed only against a valid prescription, reviewed by a licensed pharmacist. Upload a digital copy or present the original in store." },
      { question: "Which areas do you deliver to?", answer: "We deliver same-day and next-day across the city. Check the app or call us for live coverage in your area." },
      { question: "What is your return policy?", answer: "Prescription medicines cannot be returned once dispensed. Sealed, undamaged OTC products may be returned within 7 days of purchase." },
    ],
  }),
  aiStore: () => ({
    eyebrow: "Inside the platform",
    heading: { parts: [{ text: "An AI-assisted " }, { text: "pharmacy", emphasis: "italic-accent" }, { text: " platform." }] },
    lede: "Forecasting, inventory and compliance — handled quietly in the background.",
    tiles: [
      { image: "", alt: "", tag: "Forecasting", title: "Demand, predicted", description: "Models anticipate what's needed, so the right medicine is stocked before the rush." },
      { image: "", alt: "", tag: "Inventory", title: "Reordered automatically", description: "Stock thresholds trigger replenishment without a manual purchase order." },
      { image: "", alt: "", tag: "Compliance", title: "Audit-ready by default", description: "Batch traceability and expiry tracking, logged continuously." },
    ],
  }),
  gallery: () => ({
    eyebrow: "Inside our world",
    heading: { parts: [{ text: "A look " }, { text: "inside", emphasis: "italic-accent" }, { text: " our journey." }] },
    lede: "A glimpse of the people and places that keep authentic medicine moving.",
    images: [
      { src: "", alt: "", caption: "Delivery", title: "Delivered, neighbourhood-fast", description: "Medicine reaches your door in hours — not days." },
      { src: "", alt: "", caption: "In-store", title: "Licensed pharmacists", description: "Every store is run by registered pharmacists who dispense each order in person." },
      { src: "", alt: "", caption: "Care", title: "Support that's quick", description: "A team reachable fast, with an average first reply under an hour." },
      { src: "", alt: "", caption: "Range", title: "Everything in stock", description: "Medicines, OTC and wellness essentials, all under one trusted roof." },
      { src: "", alt: "", caption: "Trust", title: "Genuine, every time", description: "Sourced from licensed manufacturers and traceable end to end." },
    ],
  }),
};

/* eslint-enable @typescript-eslint/no-explicit-any */

/** Template data for a dynamic section type, or null if none defined. */
export function sectionTemplate(type: string): unknown | null {
  const make = sectionDataTemplates[type];
  return make ? make() : null;
}
