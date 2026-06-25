/**
 * @file builderData.ts
 * @description Static data + factories for the Website Builder authoring UI.
 * @responsibilities
 *  - Define the wizard STEPS and section TYPES metadata (the types our live sites use).
 *  - Provide DEFAULTS(type) returning valid section `data`, seeded with pharmacy copy.
 *  - Provide INITIAL() returning a complete, valid AppConfig draft to seed the builder.
 * @dependencies @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-23
 */
import type { AppConfig, Section, SectionType } from "@wl/config-types";
import {
  legalInfoFromConfig,
  privacyPolicyTemplate,
  termsTemplate,
  disclaimerTemplate,
  dataDeletionTemplate,
} from "./legalTemplates";

/** A wizard step in the left-nav stepper. */
export type Step = {
  id: StepId;
  label: string;
  hint: string;
  icon: string;
};

/** The six top-level wizard steps. `sections` is the page-builder canvas. */
export type StepId =
  | "identity"
  | "branding"
  | "seo"
  | "sections"
  | "navigation"
  | "legal";

/** Display + theming metadata for a section/core block in the UI. */
export type TypeMeta = {
  label: string;
  icon: string;
  blurb: string;
  dot: string;
  tint: string;
  core?: boolean;
};

/**
 * A "categories" tile section. This type ships on the live aarav site but is not
 * yet in this repo's `SectionType` union (it lives in the aarav worktree). The
 * builder is preview-only, so we model the shape locally to offer it in the picker.
 */
export type CategoryTile = { title: string; description?: string; icon?: string };
export type CategoriesSectionData = {
  eyebrow?: string;
  heading?: { parts: Array<{ text: string; emphasis?: string; br?: boolean }> };
  tagline?: string;
  items: CategoryTile[];
};

/** Section types the builder can author — the real union plus `categories`. */
export type BuilderSectionType = SectionType | "categories";

/** A draft section: real {type,data} (plus the local categories variant) + a client id. */
export type DraftSection =
  | (Section & { id: string })
  | { id: string; type: "categories"; data: CategoriesSectionData };

/** The wizard steps, in order. */
export const STEPS: Step[] = [
  { id: "identity", label: "Identity", hint: "Name & category", icon: "identity" },
  { id: "branding", label: "Branding", hint: "Logo & colours", icon: "palette" },
  { id: "seo", label: "SEO", hint: "Title & keywords", icon: "search" },
  { id: "sections", label: "Sections", hint: "Hero, blocks & more", icon: "grid" },
  { id: "navigation", label: "Navigation", hint: "Nav, footer & CTA", icon: "list" },
  { id: "legal", label: "Legal", hint: "Contact, terms & privacy", icon: "shield" },
];

/** The legal sub-sections, edited one-at-a-time on the Legal step (like Sections). */
export type LegalSectionId = "contact" | "terms" | "privacy" | "disclaimer" | "dataDeletion";

/** Card metadata for each legal sub-section: label, blurb, and an icon. */
export const LEGAL_SECTIONS: Array<{ id: LegalSectionId; label: string; blurb: string; icon: string }> = [
  { id: "contact", label: "Contact us", blurb: "Email, phone & address", icon: "mail" },
  { id: "terms", label: "Terms & Conditions", blurb: "Your terms of use", icon: "fileText" },
  { id: "privacy", label: "Privacy Policy", blurb: "How you handle data", icon: "shield" },
  { id: "disclaimer", label: "Disclaimer", blurb: "Footer + legal disclaimer", icon: "help" },
  { id: "dataDeletion", label: "Data deletion", blurb: "Account/data removal", icon: "trash" },
];

/** Steps considered "done" for the progress meter. */
export const DONE: Record<string, number> = {
  identity: 1,
  branding: 1,
  seo: 1,
  sections: 1,
  navigation: 1,
};

/** Fixed content blocks edited in the Sections step but NOT part of sections[]. */
export const CORE = ["hero", "about", "services"] as const;

/**
 * Scroll-anchor map: block/section type → the DOM id its module renders, the
 * label shown in the section dropdown, and a friendly default nav-link label.
 * Every section type the builder offers is a scroll target (its module emits an
 * `id`); a nav link points at `#<id>` to scroll the page (no route change),
 * exactly like the live UrMedz/Aarav nav.
 *  - `label`   — name shown in the editor's section dropdown.
 *  - `navLabel`— the friendly label prefilled into the link's text field.
 */
export const SECTION_ANCHORS: Record<string, { id: string; label: string; navLabel: string }> = {
  hero: { id: "top", label: "Hero", navLabel: "Home" },
  about: { id: "about", label: "About", navLabel: "About us" },
  services: { id: "services", label: "Services", navLabel: "Services" },
  appStrip: { id: "app", label: "App strip", navLabel: "Get the app" },
  stats: { id: "stats", label: "Stats", navLabel: "By the numbers" },
  savings: { id: "savings", label: "Savings", navLabel: "Savings" },
  videoFeature: { id: "fulfilment", label: "Video / Fulfilment", navLabel: "Fulfilment" },
  team: { id: "team", label: "Team", navLabel: "Our team" },
  features: { id: "features", label: "Features", navLabel: "Why us" },
  categories: { id: "categories", label: "Categories", navLabel: "Categories" },
  howItWorks: { id: "how-it-works", label: "How it works", navLabel: "How it works" },
  faq: { id: "faq", label: "FAQ", navLabel: "FAQ" },
  gallery: { id: "gallery", label: "Gallery", navLabel: "Gallery" },
  aiStore: { id: "ai-store", label: "AI store", navLabel: "AI store" },
};

/** Metadata for every block type the builder can show: core + the live section set. */
export const TYPES: Record<string, TypeMeta> = {
  // Core (fixed content; not appended to sections[])
  hero: { label: "Hero", icon: "sparkles", blurb: "Headline, tagline & CTAs", dot: "#2E6ACF", tint: "#E9F0FB", core: true },
  about: { label: "About", icon: "fileText", blurb: "Your story", dot: "#0891B2", tint: "#E2F5F9", core: true },
  services: { label: "Services", icon: "briefcase", blurb: "What you offer", dot: "#16A34A", tint: "#E7F7EE", core: true },
  // Dynamic section types used across the live sites (urmedz + aarav)
  appStrip: { label: "App strip", icon: "smartphone", blurb: "App-store download links", dot: "#4F46E5", tint: "#ECEBFD" },
  stats: { label: "Stats", icon: "bar", blurb: "Big numbers & metrics", dot: "#16A34A", tint: "#E7F7EE" },
  savings: { label: "Savings", icon: "percent", blurb: "Price-savings comparison", dot: "#0891B2", tint: "#E2F5F9" },
  videoFeature: { label: "Video", icon: "play", blurb: "Video poster + marquee", dot: "#DC2626", tint: "#FCEAEA" },
  team: { label: "Team", icon: "users", blurb: "Team quote + departments", dot: "#7C3AED", tint: "#F1EAFE" },
  features: { label: "Features", icon: "grid", blurb: "A grid of feature cards", dot: "#2E6ACF", tint: "#E9F0FB" },
  categories: { label: "Categories", icon: "shapes", blurb: "Category tiles with icons", dot: "#CA8A04", tint: "#FAF4DC" },
  howItWorks: { label: "How it works", icon: "list", blurb: "Numbered process steps", dot: "#DB2777", tint: "#FCE9F2" },
  faq: { label: "FAQ", icon: "help", blurb: "Expandable Q&A list", dot: "#D97706", tint: "#FCF1E0" },
  aiStore: { label: "AI store", icon: "sparkles", blurb: "Image/video tile grid", dot: "#7C3AED", tint: "#F1EAFE" },
  gallery: { label: "Gallery", icon: "image", blurb: "Image gallery rows", dot: "#0891B2", tint: "#E2F5F9" },
};

/**
 * Order the dynamic types appear in the "Add a section" picker — mirrors the
 * richer urmedz page order, with categories (aarav) slotted after features.
 */
export const PICKER_ORDER: BuilderSectionType[] = [
  "appStrip",
  "stats",
  "savings",
  "videoFeature",
  "team",
  "features",
  "categories",
  "howItWorks",
  "faq",
  "aiStore",
  "gallery",
];

/**
 * DEFAULTS - Produce a valid `data` object for a freshly added section type,
 * seeded with realistic pharmacy copy mirroring our live urmedz/aarav sites.
 * @param {BuilderSectionType} t - The section type to seed.
 * @returns A deep-cloned default data object for that type.
 */
export function DEFAULTS(t: BuilderSectionType): DraftSection["data"] {
  // Only the live section set is seeded here; gallery/aiStore exist in the union
  // but aren't offered by the picker, so the map is partial.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: Partial<Record<BuilderSectionType, any>> = {
    appStrip: {
      logo: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391368443_logo.png",
      heading: { parts: [{ text: "Download the " }, { text: "pharmacy", emphasis: "italic-accent" }, { text: " app" }] },
      descriptor: "Authentic medicines · licensed pharmacists · doorstep delivery",
      appStoreUrl: "https://apps.apple.com/app/urmedz",
      googlePlayUrl: "https://play.google.com/store/apps/details?id=in.urmedz",
    },
    stats: {
      eyebrow: "By the numbers",
      headline: "A network sized for the country.",
      descriptor: "A pharmacy-and-platform footprint built quietly in the background.",
      items: [
        { value: "25", suffix: "+", label: "Retail stores", footnote: "South India" },
        { value: "10000", suffix: "+", label: "Orders fulfilled daily", footnote: "Retail + quick commerce" },
        { value: "80000", suffix: "", label: "SKUs catalogued", footnote: "Medicines, OTC, wellness" },
        { value: "2", suffix: "", label: "Fulfilment centres", footnote: "Bengaluru & Hyderabad" },
      ],
    },
    savings: {
      eyebrow: "Customer savings",
      heading: { parts: [{ text: "Unraveling the magic of " }, { text: "brand options", emphasis: "italic-accent" }, { text: " in medicines." }] },
      lede: "Prices vary dramatically from brand to brand, yet the composition stays identical. The engine surfaces the optimal pick for every prescription.",
      items: [
        { name: "Diabetes Tablets", cat: "Cat. 01 · Metformin 500mg", pct: 46, color: "#F5A623" },
        { name: "Blood Sugar Tablets", cat: "Cat. 02 · Glimepiride 2mg", pct: 56, color: "#1FAFA6" },
        { name: "Blood Pressure Tablets", cat: "Cat. 03 · Amlodipine 5mg", pct: 80, color: "#6B3FA0" },
        { name: "Gastric Relief Tablets", cat: "Cat. 04 · Pantoprazole 40mg", pct: 55, color: "#E5326C" },
      ],
    },
    videoFeature: {
      tag: "Behind the scenes",
      heading: { parts: [{ text: "A look at our " }, { text: "hi-tech", emphasis: "italic-accent" }, { text: " fulfilment centres." }] },
      ctaLabel: "Watch Now",
      poster: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395081793_urmedz_video-poster.png",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      marquee: ["Authentic", "Traceable", "Compliant", "Fast", "Scalable", "Trusted", "Licensed", "Pharmacist-reviewed"],
    },
    team: {
      eyebrow: "Our team of specialists",
      logoMark: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391368443_logo.png",
      quote: { parts: [{ text: "United by a single purpose — to make healthcare " }, { text: "accessible, affordable", emphasis: "italic-accent" }, { text: " and", br: true }, { text: "trustworthy", emphasis: "italic-accent" }, { text: " for everyone." }] },
      signatureLabel: "Signed,",
      signature: "the team",
      departments: [
        { code: "01", count: 75, label: "Pharmacists", role: "Licensed dispensing", bg: "#F5A623", fg: "#1B2A5B", detail: "Every order reviewed by a registered pharmacist." },
        { code: "02", count: 25, label: "Doctors", role: "Consulting clinicians", bg: "#1FAFA6", fg: "#FFFFFF", detail: "On-call for prescription validation and refills." },
        { code: "03", count: 60, label: "Supply chain", role: "Sourcing & logistics", bg: "#6B3FA0", fg: "#FFFFFF", detail: "Batch-traceable from manufacturer to last-mile." },
        { code: "04", count: 40, label: "Health guardians", role: "Customer support", bg: "#E5326C", fg: "#FFFFFF", detail: "Reachable in four languages, fast first reply." },
      ],
      credentials: [{ label: "Care SLA", value: "Avg. reply < 1 hr · 3 languages" }],
    },
    features: {
      eyebrow: "Why choose us",
      heading: { parts: [{ text: "Pharmacy infrastructure, " }, { text: "quietly", emphasis: "italic-accent" }, { text: " done right." }] },
      items: [
        { title: "Authenticity at the source", description: "Every medicine is sourced from licensed distributors and traceable to its manufacturer — no grey-market shortcuts." },
        { title: "Scale where it matters", description: "A retail-plus-fulfilment footprint means the medicine you need is rarely more than a few kilometres away." },
        { title: "Infrastructure built for compliance", description: "Cold-chain handling, batch traceability and audit-ready dispatch — built into every store and centre." },
        { title: "An AI-assisted platform", description: "Our platform helps partner pharmacies forecast demand, manage inventory and stay compliant — quietly, in the background." },
      ],
    },
    categories: {
      eyebrow: "Featured categories",
      heading: { parts: [{ text: "Everything your family needs, under " }, { text: "one trusted roof.", emphasis: "italic-accent" }] },
      tagline: "From everyday medicines to baby care, wellness and health devices — explore the complete range we keep in stock for you.",
      items: [
        { title: "Medicines", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395080746_aarav_pharmacy_categories_medicines.png", description: "Genuine prescription and over-the-counter medicines, dispensed accurately by our pharmacy team." },
        { title: "Baby Care", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395080483_aarav_pharmacy_categories_baby-care.png", description: "Baby food, diapers, gentle skincare and daily essentials for your little one." },
        { title: "Personal Care", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395080919_aarav_pharmacy_categories_personal-care.png", description: "Skincare, haircare and everyday hygiene products from trusted brands." },
        { title: "Diabetic Care", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395080618_aarav_pharmacy_categories_diabetic-care.png", description: "Glucometers, test strips, lancets and specialised supplies to manage diabetes with confidence." },
        { title: "Ayurvedic Products", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395073704_aarav_pharmacy_categories_ayurvedic.png", description: "Time-honoured ayurvedic and herbal remedies for natural, everyday wellbeing." },
        { title: "Surgical Items", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395081086_aarav_pharmacy_categories_surgical.png", description: "Masks, gloves, dressings and surgical accessories for care and recovery at home." },
      ],
    },
    howItWorks: {
      eyebrow: "How it works",
      heading: { parts: [{ text: "Prescription to " }, { text: "pocket", emphasis: "italic-accent" }, { text: " — in three steps." }] },
      steps: [
        { step: 1, title: "Browse or upload your prescription", description: "Search our catalogue or upload a doctor's prescription — we'll match it to authentic, in-stock medicines." },
        { step: 2, title: "A licensed pharmacist reviews your order", description: "Every prescription order is reviewed by a qualified pharmacist before it's dispensed — no exceptions." },
        { step: 3, title: "Delivered or ready for pickup", description: "Collect from your nearest store or receive doorstep delivery — often same-day." },
      ],
    },
    faq: {
      eyebrow: "Frequently asked",
      heading: { parts: [{ text: "Questions,", br: true }, { text: "answered.", emphasis: "italic-accent" }] },
      lede: "Anything we missed? Reach out — our team replies within a working day.",
      ctaLabel: "Contact support",
      ctaHref: "/contact",
      items: [
        { question: "Where do you source your medicines from?", answer: "All medicines are sourced exclusively from CDSCO-licensed manufacturers and distributors. Every batch is traceable from manufacturer to shelf — no grey-market stock." },
        { question: "How do you handle prescriptions?", answer: "Prescription medicines are dispensed only against a valid prescription, reviewed by an in-house licensed pharmacist. Upload a digital copy or present the original in store." },
        { question: "Which areas do you deliver to?", answer: "We deliver same-day and next-day across the city through our quick-commerce network, with select pin codes covered more widely. Check the app for live coverage." },
        { question: "What is your return policy?", answer: "Prescription medicines cannot be returned once dispensed. Sealed, undamaged OTC products may be returned within 7 days of purchase." },
      ],
    },
    aiStore: {
      eyebrow: "Inside the platform",
      heading: { parts: [{ text: "An AI-assisted " }, { text: "pharmacy", emphasis: "italic-accent" }, { text: " platform." }] },
      lede: "Forecasting, inventory and compliance — handled quietly in the background for every partner pharmacy.",
      tiles: [
        { image: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369445_gallery-1.png", alt: "Demand forecasting", tag: "Forecasting", title: "Demand, predicted", description: "Models anticipate what each store will need, so the right medicine is stocked before the rush." },
        { image: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369651_gallery-2.png", alt: "Automated reordering", tag: "Inventory", title: "Reordered automatically", description: "Stock thresholds trigger replenishment without a manual purchase order in sight." },
        { image: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369847_gallery-3.png", alt: "Compliance monitoring", tag: "Compliance", title: "Audit-ready by default", description: "Batch traceability and expiry tracking, logged continuously across the network." },
      ],
    },
    gallery: {
      eyebrow: "Inside the network",
      heading: { parts: [{ text: "A look " }, { text: "inside", emphasis: "italic-accent" }, { text: " our journey." }] },
      lede: "From neighbourhood counters to hi-tech fulfilment floors — a glimpse of the people and places that keep authentic medicine moving.",
      images: [
        { src: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369445_gallery-1.png", alt: "Same-day delivery rider", caption: "Quick commerce", title: "Delivered, neighbourhood-fast", description: "Dark stores across the city dispatch same-day, so medicine reaches your door in hours — not days." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369651_gallery-2.png", alt: "Pharmacist at the counter", caption: "Retail", title: "Staffed by licensed pharmacists", description: "Every store is run by registered pharmacists who review and dispense each order in person." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369847_gallery-3.png", alt: "Hi-tech fulfilment centre", caption: "Fulfilment", title: "Built for scale & cold-chain", description: "Batch-traceable, temperature-controlled dispatch from our most advanced centres." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369445_gallery-1.png", alt: "Inventory dashboard", caption: "Platform", title: "Forecast-driven stocking", description: "Demand modelling keeps shelves ready before you need them." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369651_gallery-2.png", alt: "Care support team", caption: "Support", title: "Care in four languages", description: "A team reachable fast, with an average first reply under an hour." },
      ],
    },
  };
  return JSON.parse(JSON.stringify(d[t] || {}));
}

/**
 * BLANK - A minimal but VALID empty draft, for the dev-only "Clear all data"
 * action: every field is empty/default so you can build a site from scratch, but
 * the shape is complete so nothing crashes (modules already render empty config as
 * null). No sections, default theme, empty text.
 * @returns An empty AppConfig draft + empty sections + a hero-only block order.
 */
export function BLANK(): {
  config: AppConfig;
  sections: DraftSection[];
  blockOrder: string[];
} {
  const config: AppConfig = {
    tenant: { name: "", category: "" },
    branding: {
      theme: "default",
      colors: { primary: "#1F2937", secondary: "#F3F4F6", background: "#FFFFFF", text: "#111827", accent: "#2563EB", ink: "#0B1220" },
    },
    seo: { title: "", description: "", keywords: [] },
    content: {
      hero: { eyebrow: "", headline: "", headlineRich: { parts: [] }, tagline: "", cta: { label: "", type: "safe-action" }, slides: [] },
      about: undefined,
      services: [],
      sections: [],
    },
    contact: { email: "", phone: "", address: "" },
    features: { enableChat: false, enableForms: false, enablePayments: false, enableCart: false },
    compliance: { mode: "business-profile-safe", disclaimer: "" },
    layout: {
      nav: { links: [], ctas: [] },
      footer: { columns: [] },
      stickyCta: { enabled: false, text: "", ctaLabel: "", ctaHref: "" },
    },
  };
  return { config, sections: [], blockOrder: ["hero", "about", "services"] };
}

/**
 * INITIAL - Produce a complete, valid AppConfig draft to seed the builder,
 * themed as a pharmacy (mirrors the real urmedz/aarav content shapes).
 * @returns A fresh AppConfig (deep-cloned defaults) plus draft sections.
 */
export function INITIAL(): {
  config: AppConfig;
  sections: DraftSection[];
  blockOrder: string[];
} {
  const config: AppConfig = {
    tenant: { name: "UrMedz", category: "Pharmacy & Fulfilment" },
    branding: {
      logo: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391368443_logo.png",
      logoFull: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391368748_logo-full.png",
      // Colour theme → loads public/site-css/themes/urmedz.tokens.css as the colour
      // baseline; the brand colours below override it via the runtime colour bridge.
      theme: "urmedz",
      colors: {
        primary: "#0A174C",
        secondary: "#F4EFE6",
        background: "#F4EFE6",
        text: "#0A174C",
        accent: "#1FAFA6",
        ink: "#0A174C",
      },
    },
    seo: {
      title: "UrMedz — Authentic medicines, fingertip-fast",
      description:
        "A network of retail stores and India's largest pharma fulfilment centres — delivering trusted, licensed medicines to your door.",
      keywords: ["online pharmacy", "authentic medicines", "quick commerce", "licensed pharmacists", "medicine delivery"],
      siteUrl: "https://urmedz.in",
      socialProfiles: [
        "https://www.instagram.com/urmedz",
        "https://www.facebook.com/urmedz",
        "https://www.linkedin.com/company/urmedz",
      ],
    },
    content: {
      hero: {
        eyebrow: "Pharmacy & Health-Tech · Est. 2024",
        headline: "Authentic medicines, fingertip-fast.",
        headlineRich: {
          parts: [
            { text: "Authentic", br: true },
            { text: "medicines, " },
            { text: "fingertip-", emphasis: "italic" },
            { text: "fast." },
          ],
        },
        tagline:
          "A network of 25 retail stores and India's largest pharma fulfilment centres — delivering trusted medicines to you.",
        image: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391368958_hero.png",
        cta: { label: "Learn More", type: "safe-action" },
        secondaryCta: { label: "How It Works", href: "/#services" },
        proof: ["25+ retail stores", "10,000+ orders daily", "80,000 SKUs catalogued"],
        slides: [
          { image: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369445_gallery-1.png", tag: "Quick commerce", caption: "Same-day delivery, neighbourhood-fast" },
          { image: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369847_gallery-3.png", tag: "Hi-tech fulfilment", caption: "India's most advanced pharma centres" },
          { image: "https://1p-b2c-files.s3.amazonaws.com/demo_1782391369651_gallery-2.png", tag: "Retail stores", caption: "Safe, private, staffed by licensed pharmacists" },
        ],
        meta: [
          { value: "25", suffix: "+", label: "Retail stores across South India" },
          { value: "10k", suffix: " / day", label: "Orders dispensed by licensed pharmacists" },
          { value: "80k", label: "SKUs — medicines, OTC & wellness" },
        ],
      },
      about: {
        eyebrow: "About us · Est. 2024 · Bengaluru",
        title: { parts: [{ text: "Medicines are " }, { text: "indispensable.", emphasis: "italic", br: true }, { text: "Access", emphasis: "italic-accent" }, { text: " and " }, { text: "affordability", emphasis: "italic-accent" }, { text: " change lives." }] },
        lede: "We're building India's most trusted pharmaceutical infrastructure — authentic medicines, made accessible and affordable for every household.",
        description:
          "Connecting patients with authentic, affordable medicines through licensed retail stores, hi-tech fulfilment centres, and trained pharmacists — quietly, at national scale.",
        pillars: [
          { n: "01", meta: "Our mission", title: "Authentic, always", body: "Every medicine traceable to a licensed manufacturer — no grey-market stock, ever.", accent: "#1FAFA6" },
          { n: "02", meta: "Our reach", title: "Care, nearby", body: "A retail-plus-fulfilment footprint that keeps medicine within a few kilometres of you.", accent: "#F5A623" },
          { n: "03", meta: "Our promise", title: "Affordable by design", body: "Smart sourcing surfaces the best-value option for every prescription, every time.", accent: "#6B3FA0" },
        ],
      },
      services: [
        { title: "Retail Stores", description: "A network of neighbourhood pharmacies stocked with authentic, licensed medicines — and growing.", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395081496_aarav_pharmacy_icons_prescription.png" },
        { title: "Quick Commerce", description: "A network of pharma dark stores enabling same-day, on-demand medicine delivery to your door.", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395081349_aarav_pharmacy_icons_home-delivery.png" },
        { title: "Fulfilment Centres", description: "Hi-tech, compliant centres handling cold-chain storage and batch-traceable dispatch at scale.", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395081198_aarav_pharmacy_icons_healthcare-essentials.png" },
        { title: "Wellness & OTC", description: "Vitamins, supplements and everyday wellness products curated and quality-checked for your family.", icon: "https://1p-b2c-files.s3.amazonaws.com/demo_1782395081645_aarav_pharmacy_icons_wellness.png" },
      ],
      servicesMeta: {
        eyebrow: "What we do",
        ctaLabel: "Explore all services",
        ctaHref: "/#services",
      },
      sections: [],
    },
    contact: {
      email: "hello@urmedz.in",
      phone: "+91 80 4718 0000",
      address: "Koramangala, Bengaluru, Karnataka 560034",
    },
    features: { enableChat: true, enableForms: true, enablePayments: false, enableCart: false },
    compliance: {
      mode: "business-profile-safe",
      disclaimer:
        "This is a business-profile website. It provides information and a way to get in touch — no orders or payments are processed here.",
    },
    // Site chrome — drives the Navbar, Footer and sticky CTA in the preview.
    layout: {
      nav: {
        links: [
          { label: "About", href: "/#about" },
          { label: "Services", href: "/#services" },
          { label: "Team", href: "/#team" },
          { label: "FAQ", href: "/#faq" },
        ],
        ctas: [
          { label: "Login", href: "https://ros.urmedz.in/login", variant: "primary", external: true },
          { label: "Get the app", href: "/contact", variant: "ghost" },
        ],
      },
      footer: {
        headline: { parts: [{ text: "Authentic medicines,", br: true }, { text: "delivered with", emphasis: "italic-accent" }, { text: " care." }] },
        description: "A pharmacy & health-tech network — retail, quick commerce and hi-tech fulfilment for authentic medicines.",
        addressLabel: "Head office",
        columns: [
          { heading: "Company", links: [{ label: "About", href: "/#about" }, { label: "Team", href: "/#team" }, { label: "Careers", href: "/contact" }] },
          { heading: "Services", links: [{ label: "Retail stores", href: "/#services" }, { label: "Fulfilment", href: "/#fulfilment" }, { label: "Get the app", href: "/#app" }] },
          { heading: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "/terms-conditions" }, { label: "Disclaimer", href: "/disclaimer" }, { label: "Data deletion", href: "/deactivate-account" }] },
        ],
      },
      stickyCta: { enabled: true, text: "The UrMedz app is here.", ctaLabel: "Download App Now", ctaHref: "#app" },
    },
  };

  // Seed the legal pages from the templates so a fresh builder opens with complete,
  // editable Privacy / Terms / Disclaimer / Data-deletion pages (built from the
  // tenant's name + contact above). The owner can edit or reset each in the Legal step.
  const legalInfo = legalInfoFromConfig(config);
  config.layout!.pages = {
    privacyPolicy: privacyPolicyTemplate(legalInfo),
    termsAndConditions: termsTemplate(legalInfo),
    disclaimer: disclaimerTemplate(legalInfo, config.compliance.disclaimer),
    deactivateAccount: dataDeletionTemplate(legalInfo),
  };

  // Default canvas seeds EVERY section type (each pre-filled by DEFAULTS) so the
  // builder opens with a complete site — useful to review every section's UI at once.
  const order: BuilderSectionType[] = ["appStrip", "stats", "savings", "videoFeature", "team", "features", "categories", "howItWorks", "gallery", "aiStore", "faq"];
  const sections: DraftSection[] = order.map((t, i) => ({ id: "s" + (i + 1), type: t, data: DEFAULTS(t) } as DraftSection));

  // Unified block order (stable card ids), mirroring the live page layout:
  // hero → appStrip → about → services → remaining sections.
  const blockOrder: string[] = [
    "hero",
    "s1", // appStrip
    "about",
    "services",
    ...sections.slice(1).map((s) => s.id),
  ];

  return { config, sections, blockOrder };
}
