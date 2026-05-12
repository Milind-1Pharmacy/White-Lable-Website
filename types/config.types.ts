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
  warm?: string;
  cool?: string;
};

export type Branding = {
  logo?: string;
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

export type AboutContent = {
  description: string;
  image?: string;
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
  items: StatItem[];
};

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
};

export type TestimonialsSectionData = {
  eyebrow?: string;
  heading?: string;
  items: TestimonialItem[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionData = {
  heading?: string;
  items: FaqItem[];
};

export type HeroRotatingSlide = {
  firstWord: string;
  secondWord: string;
  secondWordTone: "cool" | "warm";
  subTagline: string;
  image: string;
  iconTags?: { label: string; icon?: string }[];
};

export type HeroRotatingSectionData = {
  brandWordmark?: string;
  slides: HeroRotatingSlide[];
  autoRotateSeconds?: number;
};

export type AppDownloadBadge = {
  kind: "play" | "appstore";
  href: string;
  version?: string;
  size?: string;
};

export type AppDownloadSectionData = {
  heading: string;
  badges: AppDownloadBadge[];
};

export type AboutMiniStat = {
  icon?: string;
  label: string;
};

export type AboutWithStatsSectionData = {
  eyebrow?: string;
  headline: string;
  underlinedWords?: string[];
  paragraph: string;
  miniStats: AboutMiniStat[];
};

export type ServicesIconRowItem = {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  footnote?: string;
};

export type ServicesIconRowSectionData = {
  items: ServicesIconRowItem[];
};

export type BrandOptionsRow = {
  label: string;
  position: number;
};

export type BrandOptionsCompareSectionData = {
  footnote?: string;
  headline: string;
  paragraph: string;
  image: string;
  rows: BrandOptionsRow[];
};

export type VideoFeatureSectionData = {
  poster: string;
  tag?: string;
  headline: string;
  ctaLabel?: string;
  videoSrc?: string;
  marquee?: string;
};

export type MediaSplitSectionData = {
  headline: string;
  meta?: string;
  image: string;
  videoSrc?: string;
  bottomRibbon?: string;
};

export type ProductPromoCta = {
  label: string;
  href: string;
  icon?: "lock" | "arrow";
};

export type ProductPromoSectionData = {
  eyebrow: string;
  titleLineOne: string;
  titleLineTwo: string;
  paragraph: string;
  tags?: string[];
  ctas: ProductPromoCta[];
};

export type TeamGridTile = {
  number: string;
  label: string;
  color: "mustard" | "teal" | "coral" | "navy";
  icon?: string;
};

export type TeamGridSectionData = {
  tiles: TeamGridTile[];
  medallion: string;
  eyebrow: string;
  headline: string;
  paragraph: string;
  highlightWords?: string[];
};

export type SectionType =
  | "features"
  | "howItWorks"
  | "gallery"
  | "stats"
  | "testimonials"
  | "faq"
  | "heroRotating"
  | "appDownload"
  | "aboutWithStats"
  | "servicesIconRow"
  | "brandOptionsCompare"
  | "videoFeature"
  | "mediaSplit"
  | "productPromo"
  | "teamGrid";

export type Section =
  | { type: "features"; data: FeaturesSectionData }
  | { type: "howItWorks"; data: HowItWorksSectionData }
  | { type: "gallery"; data: GallerySectionData }
  | { type: "stats"; data: StatsSectionData }
  | { type: "testimonials"; data: TestimonialsSectionData }
  | { type: "faq"; data: FaqSectionData }
  | { type: "heroRotating"; data: HeroRotatingSectionData }
  | { type: "appDownload"; data: AppDownloadSectionData }
  | { type: "aboutWithStats"; data: AboutWithStatsSectionData }
  | { type: "servicesIconRow"; data: ServicesIconRowSectionData }
  | { type: "brandOptionsCompare"; data: BrandOptionsCompareSectionData }
  | { type: "videoFeature"; data: VideoFeatureSectionData }
  | { type: "mediaSplit"; data: MediaSplitSectionData }
  | { type: "productPromo"; data: ProductPromoSectionData }
  | { type: "teamGrid"; data: TeamGridSectionData };

export type Content = {
  hero?: HeroContent;
  about?: AboutContent;
  services?: ServiceItem[];
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
