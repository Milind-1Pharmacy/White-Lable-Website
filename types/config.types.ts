export type SafeActionCta = {
  label: string;
  type: "safe-action";
};

export type Tenant = {
  name: string;
  category: string;
};

export type BrandingColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent?: string;
  ink?: string;
};

export type Branding = {
  logo?: string;
  logoFull?: string;
  stylesheet?: string;
  colors: BrandingColors;
};

export type Seo = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
};

export type RichHeadingPart = {
  text: string;
  emphasis?: "italic-accent" | "italic" | "accent";
  br?: boolean;
};

export type RichHeading = {
  parts: RichHeadingPart[];
};

export type HeroProofItem = string;

export type HeroSecondaryCta = {
  label: string;
  href?: string;
};

export type HeroSlide = {
  image: string;
  tag?: string;
  caption?: string;
};

export type HeroMetaItem = {
  value: string;
  suffix?: string;
  label: string;
};

export type HeroRail = {
  liveLabel?: string;
  locationText?: string;
  badgeColors?: string[];
  badgeText?: string;
};

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

export type PillarItem = {
  n: string;
  title: string;
  body: string;
  accent: string;
  meta: string;
};

export type AboutContent = {
  description: string;
  image?: string;
  eyebrow?: string;
  title?: RichHeading;
  lede?: string;
  pillars?: PillarItem[];
};

export type ServiceItem = {
  title: string;
  description: string;
  image?: string;
};

export type ServicesMeta = {
  eyebrow?: string;
  heading?: RichHeading;
  ctaLabel?: string;
  ctaHref?: string;
};

export type FeatureItem = {
  title: string;
  description: string;
};

export type FeaturesSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  items: FeatureItem[];
};

export type HowItWorksStep = {
  step: number;
  title: string;
  description: string;
};

export type HowItWorksSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  ctaLabel?: string;
  ctaHref?: string;
  steps: HowItWorksStep[];
};

export type GalleryImage = {
  src: string;
  alt?: string;
  caption?: string;
};

export type GallerySectionData = {
  heading?: RichHeading;
  eyebrow?: string;
  images: GalleryImage[];
};

export type StatItem = {
  value: string;
  suffix?: string;
  label: string;
  footnote?: string;
};

export type StatsSectionData = {
  eyebrow?: string;
  headline?: string;
  descriptor?: string;
  items: StatItem[];
};

export type AIStoreTile = {
  image: string;
  alt?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
  videoUrl?: string;
  background?: string;
};

export type AIStoreSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  lede?: string;
  tiles?: AIStoreTile[];
};

export type TeamDepartment = {
  code: string;
  count: number;
  label: string;
  role: string;
  bg: string;
  fg: string;
  detail: string;
};

export type TeamCredential = {
  label: string;
  value: string;
};

export type TeamSectionData = {
  eyebrow?: string;
  quote?: RichHeading;
  signature?: string;
  signatureLabel?: string;
  logoMark?: string;
  departments?: TeamDepartment[];
  credentials?: TeamCredential[];
};

export type SavingsItem = {
  name: string;
  cat: string;
  brandPrice: number;
  ourPrice: number;
  pct: number;
  color?: string;
};

export type SavingsLedger = {
  receiptLabel?: string;
  receiptValue?: string;
  averageLabel?: string;
  averageValue?: string;
  footnote?: string;
};

export type SavingsVideoCopy = {
  tag?: string;
  headline?: string;
  ctaLabel?: string;
};

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

export type VideoFeatureSectionData = {
  tag?: string;
  heading?: RichHeading;
  ctaLabel?: string;
  poster?: string;
  videoUrl?: string;
  marquee?: string[];
};

export type AppStripSectionData = {
  heading?: RichHeading;
  descriptor?: string;
  logo?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionData = {
  eyebrow?: string;
  heading?: RichHeading;
  lede?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: FaqItem[];
};

export type SectionType =
  | "features"
  | "howItWorks"
  | "gallery"
  | "stats"
  | "savings"
  | "videoFeature"
  | "appStrip"
  | "faq"
  | "aiStore"
  | "team";

export type Section =
  | { type: "features"; data: FeaturesSectionData }
  | { type: "howItWorks"; data: HowItWorksSectionData }
  | { type: "gallery"; data: GallerySectionData }
  | { type: "stats"; data: StatsSectionData }
  | { type: "savings"; data: SavingsSectionData }
  | { type: "videoFeature"; data: VideoFeatureSectionData }
  | { type: "appStrip"; data: AppStripSectionData }
  | { type: "faq"; data: FaqSectionData }
  | { type: "aiStore"; data: AIStoreSectionData }
  | { type: "team"; data: TeamSectionData };

export type Content = {
  hero: HeroContent;
  about?: AboutContent;
  services?: ServiceItem[];
  servicesMeta?: ServicesMeta;
  sections: Section[];
};

export type Contact = {
  email?: string;
  phone?: string;
  address?: string;
};

export type Features = {
  enableChat: boolean;
  enableForms: boolean;
  enablePayments: boolean;
  enableCart: boolean;
};

export type Compliance = {
  mode: "business-profile-safe";
  disclaimer: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type NavCta = {
  label: string;
  href: string;
  variant?: "primary" | "ghost" | "accent";
};

export type NavConfig = {
  links?: NavLink[];
  ctas?: NavCta[];
};

export type StickyCtaConfig = {
  enabled?: boolean;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

export type FooterBottomTag = {
  text: string;
};

export type FooterConfig = {
  headline?: RichHeading;
  ctaLabel?: string;
  ctaHref?: string;
  description?: string;
  addressLabel?: string;
  columns?: FooterColumn[];
  bottomTag?: string;
};

export type LegalPage = {
  eyebrow?: string;
  heading?: string;
  body?: string[];
  sections?: Array<{ heading?: string; body: string[] }>;
};

export type ContactPageConfig = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
};

export type NotFoundConfig = {
  code?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type PagesConfig = {
  contact?: ContactPageConfig;
  disclaimer?: LegalPage;
  privacyPolicy?: LegalPage;
  termsAndConditions?: LegalPage;
  notFound?: NotFoundConfig;
};

export type Layout = {
  nav?: NavConfig;
  footer?: FooterConfig;
  stickyCta?: StickyCtaConfig;
  pages?: PagesConfig;
};

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

export type ResolvedConfig = {
  app: AppConfig;
  system: SystemConfig;
};
