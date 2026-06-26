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
      logo: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_logo.png",
      heading: { parts: [{ text: "Get the " }, { text: "pharmacy", emphasis: "italic-accent" }, { text: " app" }] },
      descriptor: "Order in a tap · chat with your pharmacist · track delivery",
      appStoreUrl: "https://apps.apple.com/app/meri-medicines",
      googlePlayUrl: "https://play.google.com/store/apps/details?id=in.merimedicines",
    },
    stats: {
      eyebrow: "Why neighbours choose us",
      headline: "Small pharmacy, big-hearted care.",
      descriptor: "The little things that make us feel like your own.",
      items: [
        { value: "30", suffix: "min", label: "Average delivery time", footnote: "For nearby homes" },
        { value: "5000", suffix: "+", label: "Families we care for", footnote: "And growing every week" },
        { value: "100", suffix: "%", label: "Authentic medicines", footnote: "Licensed-sourced only" },
        { value: "7", suffix: "days", label: "Open all week", footnote: "9 am – 10 pm" },
      ],
    },
    savings: {
      eyebrow: "Save with smart options",
      heading: { parts: [{ text: "Same medicine, " }, { text: "kinder price.", emphasis: "italic-accent" }] },
      lede: "The composition is identical, yet prices vary brand to brand. Our pharmacists help you find the best-value option for every prescription.",
      items: [
        { name: "Diabetes Tablets", cat: "Metformin 500mg", pct: 46, color: "#E08A2B" },
        { name: "Blood Sugar Tablets", cat: "Glimepiride 2mg", pct: 56, color: "#2FA98C" },
        { name: "Blood Pressure Tablets", cat: "Amlodipine 5mg", pct: 80, color: "#6B8E3D" },
        { name: "Gastric Relief Tablets", cat: "Pantoprazole 40mg", pct: 55, color: "#C24D6B" },
      ],
      videoPoster: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_counter.png",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      videoCopy: { tag: "See how it works", headline: "How we find your best-value option", ctaLabel: "Watch Now" },
    },
    videoFeature: {
      tag: "Meet your pharmacy",
      heading: { parts: [{ text: "A warm welcome at " }, { text: "your pharmacy.", emphasis: "italic-accent" }] },
      ctaLabel: "Watch Now",
      poster: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_video_poster.png",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      marquee: ["Authentic", "Caring", "Friendly", "Nearby", "Trusted", "Affordable", "Licensed", "Always open"],
    },
    team: {
      eyebrow: "The people behind your pharmacy",
      logoMark: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_logo.png",
      quote: { parts: [{ text: "We treat every customer like a " }, { text: "neighbour", emphasis: "italic-accent" }, { text: " — with patience,", br: true }, { text: "honesty", emphasis: "italic-accent" }, { text: " and genuine care." }] },
      signatureLabel: "Signed,",
      signature: "the family",
      departments: [
        { code: "01", count: 6, label: "Pharmacists", role: "Licensed dispensing", bg: "#2FA98C", fg: "#FFFFFF", detail: "Qualified and friendly — every order checked, every question answered." },
        { code: "02", count: 4, label: "Delivery riders", role: "Free home delivery", bg: "#E08A2B", fg: "#16322A", detail: "Reliable faces who bring your medicines to the door, on time." },
        { code: "03", count: 3, label: "Care team", role: "Refills & support", bg: "#C24D6B", fg: "#FFFFFF", detail: "We remember your refills and are a call away when you need us." },
      ],
      credentials: [{ label: "Open", value: "7 days · 9 am – 10 pm" }],
    },
    features: {
      eyebrow: "Why choose us",
      heading: { parts: [{ text: "The pharmacy that " }, { text: "knows you.", emphasis: "italic-accent" }] },
      items: [
        { title: "Genuine medicines, always", description: "Sourced only from licensed distributors and stored with care — never grey-market, never expired." },
        { title: "Free same-day delivery", description: "A call or message is all it takes; we deliver to nearby homes the same day, often within the hour." },
        { title: "Refills, remembered", description: "We keep track of your regular medicines and remind you before they run out — no last-minute dashes." },
        { title: "Advice you can trust", description: "Our licensed pharmacists take the time to explain dosage, interactions and safe use — patiently." },
      ],
    },
    categories: {
      eyebrow: "Featured categories",
      heading: { parts: [{ text: "Everything your family needs, under " }, { text: "one trusted roof.", emphasis: "italic-accent" }] },
      tagline: "From everyday medicines to baby care, wellness and health devices — explore the complete range we keep in stock for you.",
      items: [
        { title: "Medicines", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_categories_medicines.png", description: "Genuine prescription and over-the-counter medicines, dispensed accurately by our pharmacy team." },
        { title: "Baby Care", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_categories_baby.png", description: "Baby food, diapers, gentle skincare and daily essentials for your little one." },
        { title: "Personal Care", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_categories_personal.png", description: "Skincare, haircare and everyday hygiene products from trusted brands." },
        { title: "Diabetic Care", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_categories_diabetic.png", description: "Glucometers, test strips, lancets and specialised supplies to manage diabetes with confidence." },
        { title: "Ayurvedic Products", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_categories_ayurvedic.png", description: "Time-honoured ayurvedic and herbal remedies for natural, everyday wellbeing." },
        { title: "Health & Wellness", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_categories_wellness.png", description: "Vitamins, supplements and immunity boosters to keep you and your family at your best." },
      ],
    },
    howItWorks: {
      eyebrow: "How it works",
      heading: { parts: [{ text: "From prescription to " }, { text: "doorstep", emphasis: "italic-accent" }, { text: " — easily." }] },
      steps: [
        { step: 1, title: "Send us your order or prescription", description: "Call, message or walk in with your prescription — we'll confirm what you need from authentic, in-stock medicines." },
        { step: 2, title: "A pharmacist checks everything", description: "A licensed pharmacist reviews your order for dosage and safety before it's packed — every single time." },
        { step: 3, title: "Delivered free, or ready to collect", description: "We deliver to your door the same day at no charge, or have it ready for a quick pickup at the counter." },
      ],
    },
    faq: {
      eyebrow: "Frequently asked",
      heading: { parts: [{ text: "Questions,", br: true }, { text: "answered.", emphasis: "italic-accent" }] },
      lede: "Anything we missed? Just call or message — we love hearing from our neighbours.",
      ctaLabel: "Contact us",
      ctaHref: "/contact",
      items: [
        { question: "Do you really deliver for free?", answer: "Yes. Home delivery is free for homes in our neighbourhood, usually the same day and often within the hour. Just call or message us your order." },
        { question: "Where do your medicines come from?", answer: "Every medicine we stock is sourced from CDSCO-licensed manufacturers and distributors, stored properly, and checked for expiry. We never carry grey-market or unlicensed stock." },
        { question: "How do prescription medicines work?", answer: "Prescription medicines are dispensed only against a valid prescription and reviewed by our in-house licensed pharmacist. Send a clear photo or bring the original to the counter." },
        { question: "Can you remind me about my refills?", answer: "Absolutely. Tell us your regular medicines and we'll keep track, reminding you before they run out so a refill is always ready." },
      ],
    },
    aiStore: {
      eyebrow: "Inside our pharmacy",
      heading: { parts: [{ text: "Care you can " }, { text: "feel", emphasis: "italic-accent" }, { text: ", every visit." }] },
      lede: "From the counter to your doorstep — a glimpse of how we look after our neighbours every single day.",
      tiles: [
        { image: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_delivery.png", alt: "Free home delivery", tag: "Delivery", title: "To your door, free", description: "A quick call or message and your medicines arrive the same day — no charge for nearby homes." },
        { image: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_counter.png", alt: "Pharmacist at the counter", tag: "Advice", title: "A pharmacist who listens", description: "Honest, patient guidance on dosage and safe use — from someone who remembers you." },
        { image: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_shelves.png", alt: "Always stocked shelves", tag: "Always ready", title: "Stocked for your family", description: "Everyday medicines, baby care and wellness essentials, kept ready so you're never caught short." },
      ],
    },
    gallery: {
      eyebrow: "Inside our pharmacy",
      heading: { parts: [{ text: "A look " }, { text: "inside", emphasis: "italic-accent" }, { text: " your neighbourhood pharmacy." }] },
      lede: "The people, the counter and the care that make us feel like family — a glimpse of everyday life at the pharmacy.",
      images: [
        { src: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_delivery.png", alt: "Delivery rider", caption: "Delivery", title: "Free, same-day delivery", description: "Our riders bring your medicines to the door, on time — at no charge for nearby homes." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_counter.png", alt: "Pharmacist at the counter", caption: "Our counter", title: "A friendly, qualified face", description: "Licensed pharmacists who review every order and answer your questions with patience." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_shelves.png", alt: "Stocked shelves", caption: "Always ready", title: "Stocked for your family", description: "Everyday medicines and wellness essentials, kept ready so you're never caught short." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_packing.png", alt: "Refill reminder", caption: "Refills", title: "We remember for you", description: "Regular medicines tracked and reminded, so a refill is always ready when you need it." },
        { src: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_gallery_counter.png", alt: "Care team on a call", caption: "Support", title: "Always a call away", description: "Reach us seven days a week — friendly help with orders, refills and advice." },
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
    tenant: { name: "Meri Medicines", category: "Neighbourhood Pharmacy" },
    branding: {
      logo: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_logo.png",
      logoFull: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_logo_full.png",
      // Colour theme → loads public/site-css/themes/urmedz.tokens.css as the colour
      // baseline; the brand colours below override it via the runtime colour bridge.
      theme: "urmedz",
      colors: {
        primary: "#1B5E4A",
        secondary: "#F3EFE6",
        background: "#F3EFE6",
        text: "#16322A",
        accent: "#2FA98C",
        ink: "#16322A",
      },
    },
    seo: {
      title: "Meri Medicines — Your Trusted Neighbourhood Pharmacy",
      description:
        "Your friendly neighbourhood pharmacy — authentic medicines, caring licensed pharmacists, free home delivery and easy prescription refills, close to home.",
      keywords: ["neighbourhood pharmacy", "local chemist", "medicine home delivery", "prescription refill", "licensed pharmacist"],
      siteUrl: "https://merimedicines.in",
      socialProfiles: [
        "https://www.instagram.com/merimedicines",
        "https://www.facebook.com/merimedicines",
        "https://www.linkedin.com/company/merimedicines",
      ],
    },
    content: {
      hero: {
        eyebrow: "Your neighbourhood pharmacy · Since 2024",
        headline: "Meri Medicines. Meri Pharmacy.",
        headlineRich: {
          parts: [
            { text: "Your pharmacy," },
            { text: " always", emphasis: "italic", br: true },
            { text: "close", emphasis: "italic-accent" },
            { text: " to home." },
          ],
        },
        tagline:
          "Authentic medicines, a pharmacist who knows you by name, and free same-day delivery to your door — that is Meri Medicines.",
        image: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_slide_counter.png",
        cta: { label: "Learn More", type: "safe-action" },
        secondaryCta: { label: "How It Works", href: "/#services" },
        proof: ["Free home delivery", "Caring licensed pharmacists", "Easy prescription refills"],
        slides: [
          { image: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_slide_delivery.png", tag: "Home delivery", caption: "Free, same-day, right to your door" },
          { image: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_slide_counter.png", tag: "Our counter", caption: "A friendly face who remembers you" },
          { image: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_slide_stocked.png", tag: "Always stocked", caption: "Everyday medicines and wellness, ready" },
        ],
        meta: [
          { value: "30", suffix: "min", label: "Average home-delivery time nearby" },
          { value: "5k", suffix: "+", label: "Families who trust us with their care" },
          { value: "100", suffix: "%", label: "Authentic, licensed-sourced medicines" },
        ],
      },
      about: {
        eyebrow: "About us · Your neighbourhood chemist",
        title: { parts: [{ text: "A pharmacy that feels like " }, { text: "family.", emphasis: "italic", br: true }, { text: "Care", emphasis: "italic-accent" }, { text: " and " }, { text: "trust", emphasis: "italic-accent" }, { text: ", close to home." }] },
        lede: "We are more than a counter. Meri Medicines is the neighbour you can lean on for genuine medicine, gentle advice and a delivery that always shows up.",
        description:
          "Meri Medicines began with a simple belief: a pharmacy should feel like family. We are your neighbourhood chemist — authentic medicines, remembered refills, free doorstep delivery, and honest advice from pharmacists who know you.",
        pillars: [
          { n: "01", meta: "Always authentic", title: "Genuine, every time", body: "Every medicine sourced from licensed distributors and stored with care — only genuine, in-date stock.", accent: "#2FA98C" },
          { n: "02", meta: "Same-day, nearby", title: "Free home delivery", body: "A call or message and we deliver to your door the same day — usually within the hour for nearby homes.", accent: "#E08A2B" },
          { n: "03", meta: "Friendly & qualified", title: "A pharmacist who cares", body: "Licensed pharmacists who check every order, answer patiently and remember your family's refills.", accent: "#C24D6B" },
        ],
      },
      services: [
        { title: "In-Store Pharmacy", description: "Walk in for authentic prescription and OTC medicines, dispensed by a licensed pharmacist who takes the time to help.", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_services_instore.png" },
        { title: "Free Home Delivery", description: "Send your order by call or message and we deliver to your door the same day — free for homes in the neighbourhood.", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_services_delivery.png" },
        { title: "Prescription Refills", description: "We remember your regular medicines and remind you before they run out, so your refills are ready when you need them.", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_services_refills.png" },
        { title: "Wellness & OTC", description: "Vitamins, baby care, personal care and everyday health essentials — curated and quality-checked for your family.", icon: "https://1p-b2c-files.s3.amazonaws.com/meri_medicines_services_wellness.png" },
      ],
      servicesMeta: {
        eyebrow: "What we offer",
        ctaLabel: "Explore all services",
        ctaHref: "/#services",
      },
      sections: [],
    },
    contact: {
      email: "care@merimedicines.in",
      phone: "+91 22 4000 1200",
      address: "Shop 4, Linking Road, Bandra West, Mumbai 400050",
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
          { label: "How it works", href: "/#how-it-works" },
          { label: "FAQ", href: "/#faq" },
        ],
        ctas: [
          { label: "My Account", href: "https://account.merimedicines.in/login", variant: "primary", external: true },
          { label: "Get the app", href: "/contact", variant: "ghost" },
        ],
      },
      footer: {
        headline: { parts: [{ text: "Meri Medicines.", br: true }, { text: "Your pharmacy,", emphasis: "italic-accent" }, { text: " close to home." }] },
        description: "Your friendly neighbourhood pharmacy — authentic medicines, caring pharmacists and free home delivery.",
        addressLabel: "Visit us",
        columns: [
          { heading: "Pharmacy", links: [{ label: "About", href: "/#about" }, { label: "Our team", href: "/#team" }, { label: "Services", href: "/#services" }] },
          { heading: "Help", links: [{ label: "How it works", href: "/#how-it-works" }, { label: "FAQ", href: "/#faq" }, { label: "Contact us", href: "/contact" }] },
          { heading: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "/terms-conditions" }, { label: "Disclaimer", href: "/disclaimer" }, { label: "Data deletion", href: "/deactivate-account" }] },
        ],
      },
      stickyCta: { enabled: true, text: "Order on the Meri Medicines app.", ctaLabel: "Get the App", ctaHref: "#app" },
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
