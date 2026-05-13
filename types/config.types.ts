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
  colors: BrandingColors;
};

export type Seo = {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
};

export type HeroProofItem = string;

export type HeroSecondaryCta = {
  label: string;
  href?: string;
};

export type HeroContent = {
  headline: string;
  tagline: string;
  image?: string;
  eyebrow?: string;
  cta: SafeActionCta;
  secondaryCta?: HeroSecondaryCta;
  proof?: HeroProofItem[];
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
  pillars?: PillarItem[];
};

export type ServiceItem = {
  title: string;
  description: string;
  image?: string;
};

export type FeatureItem = {
  title: string;
  description: string;
};

export type FeaturesSectionData = {
  heading?: string;
  items: FeatureItem[];
};

export type HowItWorksStep = {
  step: number;
  title: string;
  description: string;
};

export type HowItWorksSectionData = {
  heading?: string;
  steps: HowItWorksStep[];
};

export type GalleryImage = {
  src: string;
  alt?: string;
  caption?: string;
};

export type GallerySectionData = {
  heading?: string;
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
  items: StatItem[];
};

export type AIStoreSectionData = {
  _placeholder?: true;
};

export type TeamSectionData = {
  _placeholder?: true;
};

export type SavingsItem = {
  name: string;
  cat: string;
  brandPrice: number;
  ourPrice: number;
  pct: number;
  color?: string;
};

export type SavingsSectionData = {
  eyebrow?: string;
  heading?: string;
  items: SavingsItem[];
  videoPoster?: string;
  videoUrl?: string;
};

export type VideoFeatureSectionData = {
  tag?: string;
  heading: string;
  ctaLabel?: string;
  poster?: string;
  videoUrl?: string;
  marquee?: string[];
};

export type AppStripSectionData = {
  heading?: string;
  descriptor?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionData = {
  heading?: string;
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
  about: AboutContent;
  services: ServiceItem[];
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

export type AppConfig = {
  tenant: Tenant;
  branding: Branding;
  seo: Seo;
  content: Content;
  contact: Contact;
  features: Features;
  compliance: Compliance;
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
