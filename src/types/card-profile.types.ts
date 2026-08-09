/**
 * Card profile / template type (Super Admin only).
 * Drives public mini-site copy + default section visibility presets.
 */

import {
  DEFAULT_CARD_SECTIONS,
  type ICardSections,
} from "./card-sections.types";

export const CARD_PROFILE_TYPES = [
  "individual",
  "business",
  "shop",
] as const;

export type CardProfileType = (typeof CARD_PROFILE_TYPES)[number];

export const DEFAULT_CARD_PROFILE_TYPE: CardProfileType = "business";

export const CARD_PROFILE_TYPE_OPTIONS: {
  value: CardProfileType;
  label: string;
  description: string;
}[] = [
  {
    value: "individual",
    label: "Individual",
    description: "Personal bio, portfolio, and resume / personal links",
  },
  {
    value: "business",
    label: "Business",
    description: "Professional services, brand identity, corporate links",
  },
  {
    value: "shop",
    label: "Shop",
    description: "Products, store hours, catalog, and shop CTAs",
  },
];

/** Section visibility preset applied when Super Admin assigns a type */
export const PROFILE_TYPE_SECTION_PRESETS: Record<
  CardProfileType,
  ICardSections
> = {
  individual: {
    identityCard: true,
    about: true,
    stats: true,
    whyChoose: true,
    services: false,
    portfolio: true,
    reviews: true,
    qrTerminal: true,
    connect: true,
    finalCta: true,
  },
  business: {
    ...DEFAULT_CARD_SECTIONS,
  },
  shop: {
    identityCard: true,
    about: true,
    stats: false,
    whyChoose: true,
    services: true,
    portfolio: true,
    reviews: true,
    qrTerminal: true,
    connect: true,
    finalCta: true,
  },
};

export type ProfileTypeCopy = {
  aboutEyebrow: string;
  aboutTitle: string;
  aboutEmptyHint: string;
  statsEyebrow?: string;
  whyTitle: string;
  whySubtitle: string;
  servicesEyebrow: string;
  servicesTitle: string;
  servicesSubtitle: string;
  portfolioEyebrow: string;
  portfolioTitle: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  connectEyebrow: string;
  connectTitle: string;
  finalCtaTitle: (name: string) => string;
  finalCtaSubtitle: string;
  finalConnectLabel: string;
  heroRoleFallback: string;
};

export const PROFILE_TYPE_COPY: Record<CardProfileType, ProfileTypeCopy> = {
  individual: {
    aboutEyebrow: "Profile",
    aboutTitle: "About me",
    aboutEmptyHint: "Add a short personal bio",
    whyTitle: "Why work with me",
    whySubtitle: "Trust, clarity, and results — what clients remember.",
    servicesEyebrow: "Offerings",
    servicesTitle: "What I offer",
    servicesSubtitle: "Selected skills and personal services.",
    portfolioEyebrow: "Portfolio",
    portfolioTitle: "Selected work",
    reviewsEyebrow: "Testimonials",
    reviewsTitle: "What people say",
    connectEyebrow: "Connect",
    connectTitle: "Let’s talk",
    finalCtaTitle: (name) => `Ready to connect with ${name || "me"}?`,
    finalCtaSubtitle: "Save my contact or reach out directly.",
    finalConnectLabel: "Get in touch",
    heroRoleFallback: "Professional",
  },
  business: {
    aboutEyebrow: "Company",
    aboutTitle: "About",
    aboutEmptyHint: "Add a company overview",
    whyTitle: "Why choose us",
    whySubtitle: "Brand trust, capability, and partnership.",
    servicesEyebrow: "Capabilities",
    servicesTitle: "Services & solutions",
    servicesSubtitle:
      "A flexible catalog across insurance, finance, travel, technology, and more.",
    portfolioEyebrow: "Portfolio",
    portfolioTitle: "Work & media",
    reviewsEyebrow: "Client voice",
    reviewsTitle: "Trusted by partners",
    connectEyebrow: "Connect with us",
    connectTitle: "One tap to reach out",
    finalCtaTitle: (name) =>
      name ? `Let’s build with ${name}` : "Let’s build your secure tomorrow",
    finalCtaSubtitle: "Start a conversation with our team.",
    finalConnectLabel: "Connect now",
    heroRoleFallback: "Business",
  },
  shop: {
    aboutEyebrow: "Store",
    aboutTitle: "About the shop",
    aboutEmptyHint: "Add store details and policies",
    whyTitle: "Why shop with us",
    whySubtitle: "Quality products, clear pricing, and reliable service.",
    servicesEyebrow: "Catalog",
    servicesTitle: "Products & offers",
    servicesSubtitle: "Browse featured products and current promotions.",
    portfolioEyebrow: "Gallery",
    portfolioTitle: "Store gallery",
    reviewsEyebrow: "Reviews",
    reviewsTitle: "Happy customers",
    connectEyebrow: "Visit / order",
    connectTitle: "Shop CTAs",
    finalCtaTitle: (name) =>
      name ? `Shop ${name} today` : "Ready to place an order?",
    finalCtaSubtitle: "Call, WhatsApp, or visit during store hours.",
    finalConnectLabel: "Order / enquire",
    heroRoleFallback: "Store",
  },
};

export function resolveCardProfileType(
  raw?: string | null,
): CardProfileType {
  if (raw === "individual" || raw === "business" || raw === "shop") return raw;
  return DEFAULT_CARD_PROFILE_TYPE;
}

export function isCardProfileType(value: unknown): value is CardProfileType {
  return (
    typeof value === "string" &&
    (CARD_PROFILE_TYPES as readonly string[]).includes(value)
  );
}
