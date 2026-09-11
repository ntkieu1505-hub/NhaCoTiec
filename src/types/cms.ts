export interface HomepageHero {
  headline: string;
  subtext: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  ctaText: string;
  ctaUrl?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  badge?: string;
  badges?: string[];
  indicator1Text?: string;
  indicator2Text?: string;
  enabled?: boolean;
}

export interface HomepageIntroStep {
  step: string;
  title: string;
  desc: string;
  icon?: string;
}

export interface HomepageIntro {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  steps?: HomepageIntroStep[];
  enabled?: boolean;
}

export interface HomepageFeaturedTemplates {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description: string;
  featuredTemplateIds?: string[];
  enabled?: boolean;
}

export interface HomepageFeature {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  thumbnailUrl?: string;
  enabled: boolean;
  displayOrder?: number;
  order?: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  coupleName: string;
  shortInfo?: string;
  location?: string;
  weddingDate?: string;
  content?: string;
  quote?: string;
  rating: number; // 1 - 5
  avatarUrl?: string;
  thumbnailUrl?: string;
  enabled: boolean;
  displayOrder?: number;
  order?: number;
}

export interface HomepageCta {
  heading?: string;
  headline?: string;
  subtext?: string;
  description: string;
  buttonText: string;
  buttonUrl?: string;
  buttonLink?: string;
  guaranteeText?: string;
  backgroundImageUrl?: string;
  enabled?: boolean;
}

export interface SiteFooter {
  brandName?: string;
  slogan?: string;
  brandDescription?: string;
  phone?: string;
  hotline?: string;
  email: string;
  address: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  threadsUrl?: string;
  zaloUrl?: string;
  openingHours?: string;
  workingHours?: string;
  copyright?: string;
  copyrightText?: string;
  socialLinks?: { platform: string; url: string }[];
}

export interface ContactPageContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description: string;
  phone?: string;
  hotline?: string;
  email: string;
  address: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  threadsUrl?: string;
  zaloUrl?: string;
  zaloHandle?: string;
  mapUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  workingHours?: string;
  slaCommitmentTitle?: string;
  slaCommitmentDesc?: string;
  socialLinks?: { platform: string; url: string }[];
}

export interface SiteSettings {
  siteName: string;
  siteSlogan?: string;
  tagline?: string;
  metaDescription: string;
  hotline: string;
  supportEmail: string;
  zaloSupportUrl?: string;
  zaloDisplayName?: string;
  zaloPhone?: string;
  announcementBanner?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
}

export interface SocialPlatformConfig {
  enabled: boolean;
  url: string;
}

export interface SocialLinksConfig {
  facebook: SocialPlatformConfig;
  instagram: SocialPlatformConfig;
  tiktok: SocialPlatformConfig;
  threads: SocialPlatformConfig;
  zalo: SocialPlatformConfig;
}

export interface OrderFormConfig {
  title: string;
  subtitle: string;
  noticeText: string;
  supportZalo: string;
  supportZaloLink: string;
  photoGuideNote: string;
  maxPhotos: number;
  showParentsSection: boolean;
  showLoveStorySection: boolean;
  showTimelineSection: boolean;
  showVideoSection: boolean;
  showRsvpSection: boolean;
  rsvpTitle?: string;
  rsvpSubtitle?: string;
  rsvpNote?: string;
  rsvpFeatures?: string[];
  termsText: string;
}

export interface CmsContent {
  hero: HomepageHero;
  intro: HomepageIntro;
  featuredTemplates: HomepageFeaturedTemplates;
  features: HomepageFeature[];
  testimonials: Testimonial[];
  cta: HomepageCta;
  footer: SiteFooter;
  contact: ContactPageContent;
  settings: SiteSettings;
  socialLinks?: SocialLinksConfig;
  orderForm?: OrderFormConfig;
}

