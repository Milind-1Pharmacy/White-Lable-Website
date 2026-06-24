/**
 * @file config.types.ts
 * @description Master TypeScript shape for tenant and system config JSON.
 * @responsibilities
 *  - Define the AppConfig tree consumed by every module.
 *  - Define section data shapes and the section allowlist union.
 *  - Define the SystemConfig used for defaults and compliance.
 * @dependencies none
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */

/** A non-transactional CTA. type "safe-action" keeps the site compliant. */
export type SafeActionCta = {
  label: string;
  type: "safe-action";
};

/** Basic tenant identity. */
export type Tenant = {
  name: string;
  category: string;
};

/** Brand palette mapped to CSS variables by the theme loader. */
export type BrandingColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent?: string;
  ink?: string;
};

/** Logos, theme, and color palette for a tenant. */
export type Branding = {
  logo?: string;
  logoFull?: string; // wide ~2:1 lockup; logo is the square mark
  /**
   * Colour-theme name → the token file the live site loads as its colour baseline
   * (public/site-css/themes/<theme>.tokens.css). The shared blocks.css supplies all
   * structure; the theme only sets default colours, which the user's brand colours
   * then override at runtime via the colour bridge. Defaults to "default".
   */
  theme?: string;
  /** @deprecated legacy whole-stylesheet path; kept for backward-compat. Prefer `theme`. */
  stylesheet?: string;
  colors: BrandingColors;
};

/** SEO metadata fed into Next.js Metadata. */
export type Seo = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  /** Canonical absolute site URL (e.g. https://acme.com). Drives canonical + JSON-LD + sitemap. */
  siteUrl?: string;
  /** Public social-profile URLs (schema.org sameAs) — strengthens entity SEO + rich results. */
  socialProfiles?: string[];
};

/** One styled fragment of a heading. */
export type RichHeadingPart = {
  text: string;
  emphasis?: "italic-accent" | "italic" | "accent"; // visual style for this fragment
  br?: boolean; // force a line break after this part
};

/** A heading built from ordered, individually styled parts. */
export type RichHeading = {
  parts: RichHeadingPart[];
};

/** A short trust/proof line in the hero. */
export type HeroProofItem = string;

/** Optional secondary hero CTA. */
export type HeroSecondaryCta = {
  label: string;
  href?: string;
};

/** A single image slide in the hero carousel. */
export type HeroSlide = {
  image: string;
  tag?: string;
  caption?: string;
};

/** A hero stat shown as value + suffix + label. */
export type HeroMetaItem = {
  value: string;
  suffix?: string;
  label: string;
};

/** Live-status rail shown alongside the hero. */
export type HeroRail = {
  liveLabel?: string;
  locationText?: string;
  badgeColors?: string[];
  badgeText?: string;
};

/** Full hero section content. */
export type HeroContent = {
  headline: string;
  headlineRich?: RichHeading;
  tagline: string;
  image?: string;
  eyebrow?: string;
  cta: SafeActionCta;
  secondaryCta?: HeroSecondaryCta;
  proof?: HeroProofItem[];
  slides?: HeroSlide[];
  meta?: HeroMetaItem[];
  rail?: HeroRail;
};

/** A numbered "pillar" card in the About section. */
export type PillarItem = {
  n: string;
  title: string;
  body: string;
  accent: string;
  meta: string;
};

/** About section content. */
export type AboutContent = {
  description: string;
  image?: string;
  eyebrow?: string;
  title?: RichHeading;
  lede?: string;
  pillars?: PillarItem[];
};

/** A single service card. */
export type ServiceItem = {
  title: string;
  description: string;
  image?: string;
  icon?: string;
};

/** Heading and CTA shown above the services grid. */
export type ServicesMeta = {
  eyebrow?: string;
  heading?: RichHeading;
  ctaLabel?: string;
  ctaHref?: string;
};

/** A single feature item. */
export type FeatureItem = {
  title: string;
  description: string;
};

/** Data for a "features" section. */
export type FeaturesSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  items: FeatureItem[];
};

/** A single category tile (name, optional icon and blurb). */
export type CategoryItem = {
  title: string;
  icon?: string;
  description?: string;
};

/** Data for a "categories" section. */
export type CategoriesSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  tagline?: string;
  items: CategoryItem[];
};

/** One ordered step in a how-it-works flow. */
export type HowItWorksStep = {
  step: number;
  title: string;
  description: string;
};

/** Data for a "howItWorks" section. */
export type HowItWorksSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  ctaLabel?: string;
  ctaHref?: string;
  steps: HowItWorksStep[];
};

/** A single gallery image. */
export type GalleryImage = {
  src: string;
  alt?: string;
  /** Short kicker shown as an uppercase label (e.g. a place or theme). */
  caption?: string;
  /** Editorial title for the frame, shown larger on hover/reveal. */
  title?: string;
  /** One-line description that fills the frame's caption block. */
  description?: string;
};

/** Data for a "gallery" section. */
export type GallerySectionData = {
  heading?: RichHeading;
  eyebrow?: string;
  /** Optional intro line shown beside the heading. */
  lede?: string;
  images: GalleryImage[];
};

/** A single stat with value, suffix, and label. */
export type StatItem = {
  value: string;
  suffix?: string;
  label: string;
  footnote?: string;
};

/** Data for a "stats" section. */
export type StatsSectionData = {
  eyebrow?: string;
  headline?: string;
  descriptor?: string;
  items: StatItem[];
};

/** A media tile in the AI-store section. */
export type AIStoreTile = {
  image: string;
  alt?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
  videoUrl?: string;
  background?: string;
  /** Capability title shown on the tile (editorial card). */
  title?: string;
  /** One-line description of the capability. */
  description?: string;
};

/** Data for an "aiStore" section. */
export type AIStoreSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  lede?: string;
  tiles?: AIStoreTile[];
};

/** A team department tile. */
export type TeamDepartment = {
  code: string;
  count: number;
  label: string;
  role: string;
  bg: string;
  fg: string;
  detail: string;
};

/** A team credential or certification. */
export type TeamCredential = {
  label: string;
  value: string;
};

/** Data for a "team" section. */
export type TeamSectionData = {
  eyebrow?: string;
  quote?: RichHeading;
  signature?: string;
  signatureLabel?: string;
  logoMark?: string;
  departments?: TeamDepartment[];
  credentials?: TeamCredential[];
};

/** A savings comparison row. */
export type SavingsItem = {
  name: string;
  cat: string;
  ourPrice?: number;
  pct: number;
  color?: string;
};

/** Summary ledger shown beside savings items. */
export type SavingsLedger = {
  receiptLabel?: string;
  receiptValue?: string;
  averageLabel?: string;
  averageValue?: string;
  footnote?: string;
};

/** Copy for the savings section video. */
export type SavingsVideoCopy = {
  tag?: string;
  headline?: string;
  ctaLabel?: string;
};

/** Data for a "savings" section. */
export type SavingsSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  lede?: string;
  items: SavingsItem[];
  ledger?: SavingsLedger;
  videoPoster?: string;
  videoUrl?: string;
  videoCopy?: SavingsVideoCopy;
};

/** Data for a "videoFeature" section. */
export type VideoFeatureSectionData = {
  tag?: string;
  heading?: RichHeading;
  ctaLabel?: string;
  poster?: string;
  videoUrl?: string;
  marquee?: string[]; // scrolling text strip
};

/** Data for an "appStrip" section (app-store download links). */
export type AppStripSectionData = {
  heading?: RichHeading;
  descriptor?: string;
  logo?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
};

/** A single FAQ entry. */
export type FaqItem = {
  question: string;
  answer: string;
  learnMoreLabel?: string;
  learnMoreHref?: string;
};

/** Data for a "faq" section. */
export type FaqSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  lede?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: FaqItem[];
};

/** Allowed section types; the compliance filter suppresses any others. */
export type SectionType =
  | "features"
  | "categories"
  | "howItWorks"
  | "gallery"
  | "stats"
  | "savings"
  | "videoFeature"
  | "appStrip"
  | "faq"
  | "aiStore"
  | "team";

/** A discriminated union: type selects the matching data shape. */
export type Section =
  | { type: "features"; data: FeaturesSectionData }
  | { type: "categories"; data: CategoriesSectionData }
  | { type: "howItWorks"; data: HowItWorksSectionData }
  | { type: "gallery"; data: GallerySectionData }
  | { type: "stats"; data: StatsSectionData }
  | { type: "savings"; data: SavingsSectionData }
  | { type: "videoFeature"; data: VideoFeatureSectionData }
  | { type: "appStrip"; data: AppStripSectionData }
  | { type: "faq"; data: FaqSectionData }
  | { type: "aiStore"; data: AIStoreSectionData }
  | { type: "team"; data: TeamSectionData };

/** All page content: fixed hero/about/services plus ordered dynamic sections. */
export type Content = {
  hero: HeroContent;
  about?: AboutContent;
  services?: ServiceItem[];
  servicesMeta?: ServicesMeta;
  sections: Section[];
  /**
   * Optional explicit render order for the home page blocks. Tokens:
   *  - "hero" | "about" | "services" — the fixed core blocks
   *  - "section:<i>" — content.sections[<i>] (its index in the array)
   * Hero always renders first regardless. When omitted, the legacy fixed order
   * (hero → appStrip → about → services → remaining sections) is used.
   */
  order?: string[];
};

/** Tenant contact details. */
export type Contact = {
  email?: string;
  phone?: string;
  address?: string;
};

/** Feature flags. Payments and cart are force-disabled by compliance. */
export type Features = {
  enableChat: boolean;
  enableForms: boolean;
  enablePayments: boolean;
  enableCart: boolean;
};

/** Compliance mode and the disclaimer rendered in the footer. */
export type Compliance = {
  mode: "business-profile-safe";
  disclaimer: string;
};

/** A nav or footer link. */
export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

/** A nav CTA button. external opens in a new tab. */
export type NavCta = {
  label: string;
  href: string;
  variant?: "primary" | "ghost" | "accent";
  external?: boolean;
};

/** Navigation links and CTAs. */
export type NavConfig = {
  links?: NavLink[];
  ctas?: NavCta[];
};

/** Optional sticky bottom CTA bar. */
export type StickyCtaConfig = {
  enabled?: boolean;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/** A footer link column. */
export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

/** Small tag shown in the footer bottom bar. */
export type FooterBottomTag = {
  text: string;
};

/** Footer content: headline, CTA, description, and link columns. */
export type FooterConfig = {
  headline?: RichHeading;
  ctaLabel?: string;
  ctaHref?: string;
  description?: string;
  addressLabel?: string;
  columns?: FooterColumn[];
  bottomTag?: string;
};

/** A block of legal copy: paragraph or list. */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] };

/** A titled section of a legal page. */
export type LegalSection = {
  heading?: string;
  subheading?: string;
  body: Array<string | LegalBlock>; // plain strings or structured blocks
};

/** A legal page (privacy, terms, disclaimer, etc.). */
export type LegalPage = {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  body?: Array<string | LegalBlock>;
  sections?: LegalSection[];
  video?: {
    src: string;
    poster?: string;
    caption?: string;
  };
};

/** Contact page header copy. */
export type ContactPageConfig = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
};

/** Copy for the 404 not-found page. */
export type NotFoundConfig = {
  code?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/** Config for standalone pages (contact, legal, 404). */
export type PagesConfig = {
  contact?: ContactPageConfig;
  disclaimer?: LegalPage;
  privacyPolicy?: LegalPage;
  termsAndConditions?: LegalPage;
  deactivateAccount?: LegalPage;
  notFound?: NotFoundConfig;
};

/** Site chrome: nav, footer, sticky CTA, and standalone pages. */
export type Layout = {
  nav?: NavConfig;
  footer?: FooterConfig;
  stickyCta?: StickyCtaConfig;
  pages?: PagesConfig;
};

/** The full tenant config tree loaded from configs/<tenant>.json. */
export type AppConfig = {
  tenant: Tenant;
  branding: Branding;
  seo: Seo;
  content: Content;
  contact: Contact;
  features: Features;
  compliance: Compliance;
  layout?: Layout;
};

/** Non-tenant defaults and the compliance ruleset (configs/system.json). */
export type SystemConfig = {
  version: string;
  mode: string;
  architecture: { rules: string[] };
  routing: { requiredPages: string[]; fallback: string };
  rendering: {
    default: string;
    strategy: string;
    revalidateSeconds: number;
  };
  sectionAllowlist: SectionType[];
  sectionMapping: Record<string, string>;
  compliance: {
    defaultMode: string;
    rules: string[];
    unsafeCtaLabels: string[];
    safeCtaFallback: string;
    forceDisabledFeatures: Array<keyof Features>;
    defaultDisclaimer: string;
  };
  performance: { rules: string[] };
  branding: { fallbackColors: BrandingColors };
};

/** App config merged with system config after validation and filtering. */
export type ResolvedConfig = {
  app: AppConfig;
  system: SystemConfig;
};
