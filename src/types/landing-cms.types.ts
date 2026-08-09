/**
 * Landing page CMS content (stored in platform_settings.landing_cms).
 */

export type LandingFeatureIconKey =
  | "badge"
  | "package"
  | "qr"
  | "images"
  | "globe"
  | "shield";

export type LandingFeatureFrom = "left" | "right" | "up";

export interface ILandingHeroContent {
  badge: string;
  brandLine: string;
  /** Typewriter rotating phrases */
  typewriterPhrases: string[];
  typewriterPrefix: string;
  typewriterSuffix: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface ILandingFeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LandingFeatureIconKey;
  /** Optional grid span hint */
  wide?: boolean;
}

export interface ILandingFeaturesContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: ILandingFeatureItem[];
}

export interface ILandingPricingPlan {
  id: string;
  name: string;
  blurb: string;
  monthly: number;
  yearly: number;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface ILandingPricingContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  plans: ILandingPricingPlan[];
}

export interface ILandingTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface ILandingTestimonialsContent {
  eyebrow: string;
  title: string;
  items: ILandingTestimonial[];
}

export interface ILandingCtaContent {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface ILandingFooterLink {
  href: string;
  label: string;
}

export interface ILandingFooterColumn {
  title: string;
  links: ILandingFooterLink[];
}

export interface ILandingFooterContent {
  brandSubline: string;
  description: string;
  copyrightNote: string;
  columns: ILandingFooterColumn[];
}

export interface ILandingCms {
  hero: ILandingHeroContent;
  features: ILandingFeaturesContent;
  pricing: ILandingPricingContent;
  testimonials: ILandingTestimonialsContent;
  cta: ILandingCtaContent;
  footer: ILandingFooterContent;
}

export const DEFAULT_LANDING_CMS: ILandingCms = {
  hero: {
    badge: "Cinematic digital identity",
    brandLine: "FutureCard",
    typewriterPhrases: [
      "stunning digital visiting card",
      "verified brand presence",
      "shareable business identity",
    ],
    typewriterPrefix: "Create your",
    typewriterSuffix: "in minutes",
    subtitle:
      "One explosive link for Call, WhatsApp, UPI Pay, galleries, and Future Shield verification — built for modern Indian businesses.",
    primaryCtaLabel: "Get Started Free",
    primaryCtaHref: "/register",
    secondaryCtaLabel: "View Live Demo",
    secondaryCtaHref: "/dhanya_enterprises",
  },
  features: {
    eyebrow: "Platform",
    title: "Interactive power, beautifully packed",
    subtitle:
      "Scroll to watch each tile burst into place — liquid hover, glow borders, and spring physics.",
    items: [
      {
        id: "f1",
        title: "Verified Badges",
        description:
          "Instagram-style blue ticks and Future Shield trust marks that build instant credibility.",
        icon: "badge",
        wide: true,
      },
      {
        id: "f2",
        title: "WhatsApp Inquiry",
        description:
          "Product catalogs with one-tap Inquiry Now straight into WhatsApp chats.",
        icon: "package",
      },
      {
        id: "f3",
        title: "UPI Pay Now",
        description:
          "QR + UPI ID + mobile in a polished payment modal customers actually use.",
        icon: "qr",
      },
      {
        id: "f4",
        title: "Galleries",
        description:
          "Image grids and short videos with lightbox — show work, not just words.",
        icon: "images",
      },
      {
        id: "f5",
        title: "Custom Domains",
        description:
          "card.yourbrand.com with Super Admin approval and live activation control.",
        icon: "globe",
      },
      {
        id: "f6",
        title: "Super Admin Controls",
        description:
          "Permissions, subscriptions, expiry sweeps, and domain requests — one cockpit.",
        icon: "shield",
        wide: true,
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Plans that glow as you grow",
    subtitle:
      "Start free. Upgrade when you need more cards, domains, and control.",
    plans: [
      {
        id: "free",
        name: "Starter",
        blurb: "Try the platform with one live card.",
        monthly: 0,
        yearly: 0,
        features: [
          "1 digital card",
          "Core action buttons",
          "Public share link",
          "Basic branding",
        ],
        ctaLabel: "Start free",
        ctaHref: "/register",
      },
      {
        id: "basic",
        name: "Growth",
        blurb: "For growing shops and freelancers.",
        monthly: 299,
        yearly: 2499,
        features: [
          "Up to 3 cards",
          "Services & galleries",
          "UPI Pay Now",
          "Analytics insights",
        ],
        ctaLabel: "Choose plan",
        ctaHref: "/register",
      },
      {
        id: "premium",
        name: "Business",
        blurb: "Full suite with domains & admin power.",
        monthly: 599,
        yearly: 4999,
        popular: true,
        features: [
          "Up to 10 cards",
          "Custom domain mapping",
          "Verified badge ready",
          "Priority feature access",
        ],
        ctaLabel: "Choose plan",
        ctaHref: "/register",
      },
    ],
  },
  testimonials: {
    eyebrow: "Stories",
    title: "Voices that slide into view",
    items: [
      {
        id: "t1",
        name: "Ananya Mehta",
        role: "Boutique Owner, Jaipur",
        quote:
          "Our WhatsApp inquiries doubled in a week. Customers love tapping Pay Now and browsing the gallery from one link.",
      },
      {
        id: "t2",
        name: "Rahul Krishnan",
        role: "Wholesale Distributor, Kochi",
        quote:
          "FutureCard replaced printed cards and a messy Google Site. Verified badge and GST on the profile look completely professional.",
      },
      {
        id: "t3",
        name: "Priya Shah",
        role: "Interior Studio, Ahmedabad",
        quote:
          "Custom domain approval was smooth. Clients now open studio.priyashah.com and book appointments without asking for our number.",
      },
      {
        id: "t4",
        name: "Vikram Patel",
        role: "Auto Spare Hub, Surat",
        quote:
          "UPI QR on the card closed deals on the shop floor. The animated card preview sold us before we even signed up.",
      },
    ],
  },
  cta: {
    title: "Your next customer is one tap away",
    subtitle:
      "Launch a polished digital card today — free to start, ready to scale.",
    buttonLabel: "Create your FutureCard",
    buttonHref: "/register",
  },
  footer: {
    brandSubline: "Verified by Future Shield",
    description:
      "The modern digital visiting card platform — shareable, trackable, and verified by Future Shield.",
    copyrightNote: "Built for speed, trust, and beautiful first impressions.",
    columns: [
      {
        title: "Product",
        links: [
          { href: "#features", label: "Features" },
          { href: "#pricing", label: "Pricing" },
          { href: "/dhanya_enterprises", label: "Live demo" },
        ],
      },
      {
        title: "Account",
        links: [
          { href: "/login", label: "Sign in" },
          { href: "/register", label: "Create account" },
          { href: "/dashboard", label: "Dashboard" },
        ],
      },
      {
        title: "Company",
        links: [
          { href: "#stories", label: "Customers" },
          { href: "mailto:hello@futurecard.pro", label: "Contact" },
        ],
      },
    ],
  },
};

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asStringArray(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const out = v.filter((x): x is string => typeof x === "string" && Boolean(x.trim()));
  return out.length ? out : fallback;
}

const ICON_KEYS: LandingFeatureIconKey[] = [
  "badge",
  "package",
  "qr",
  "images",
  "globe",
  "shield",
];

function resolveIcon(v: unknown): LandingFeatureIconKey {
  if (typeof v === "string" && (ICON_KEYS as string[]).includes(v)) {
    return v as LandingFeatureIconKey;
  }
  return "badge";
}

/** Deep-merge raw CMS JSON with defaults so partial rows still render */
export function resolveLandingCms(raw?: Partial<ILandingCms> | null): ILandingCms {
  const r = (raw || {}) as Partial<ILandingCms>;
  const d = DEFAULT_LANDING_CMS;

  const heroIn = (r.hero || {}) as Partial<ILandingHeroContent>;
  const featuresIn = (r.features || {}) as Partial<ILandingFeaturesContent>;
  const pricingIn = (r.pricing || {}) as Partial<ILandingPricingContent>;
  const testimonialsIn = (r.testimonials ||
    {}) as Partial<ILandingTestimonialsContent>;
  const ctaIn = (r.cta || {}) as Partial<ILandingCtaContent>;
  const footerIn = (r.footer || {}) as Partial<ILandingFooterContent>;

  const featureItems =
    Array.isArray(featuresIn.items) && featuresIn.items.length
      ? featuresIn.items.map((item, i) => {
          const fallback = d.features.items[i] || d.features.items[0]!;
          return {
            id: asString(item?.id, fallback.id),
            title: asString(item?.title, fallback.title),
            description: asString(item?.description, fallback.description),
            icon: resolveIcon(item?.icon ?? fallback.icon),
            wide: Boolean(item?.wide ?? fallback.wide),
          };
        })
      : d.features.items;

  const plans =
    Array.isArray(pricingIn.plans) && pricingIn.plans.length
      ? pricingIn.plans.map((plan, i) => {
          const fallback = d.pricing.plans[i] || d.pricing.plans[0]!;
          return {
            id: asString(plan?.id, fallback.id),
            name: asString(plan?.name, fallback.name),
            blurb: asString(plan?.blurb, fallback.blurb),
            monthly: asNumber(plan?.monthly, fallback.monthly),
            yearly: asNumber(plan?.yearly, fallback.yearly),
            popular: Boolean(plan?.popular),
            features: asStringArray(plan?.features, fallback.features),
            ctaLabel: asString(plan?.ctaLabel, fallback.ctaLabel),
            ctaHref: asString(plan?.ctaHref, fallback.ctaHref),
          };
        })
      : d.pricing.plans;

  const testimonials =
    Array.isArray(testimonialsIn.items) && testimonialsIn.items.length
      ? testimonialsIn.items.map((item, i) => {
          const fallback = d.testimonials.items[i] || d.testimonials.items[0]!;
          return {
            id: asString(item?.id, fallback.id),
            name: asString(item?.name, fallback.name),
            role: asString(item?.role, fallback.role),
            quote: asString(item?.quote, fallback.quote),
          };
        })
      : d.testimonials.items;

  const columns =
    Array.isArray(footerIn.columns) && footerIn.columns.length
      ? footerIn.columns.map((col, i) => {
          const fallback = d.footer.columns[i] || d.footer.columns[0]!;
          const links =
            Array.isArray(col?.links) && col.links.length
              ? col.links.map((l, j) => ({
                  href: asString(l?.href, fallback.links[j]?.href || "#"),
                  label: asString(l?.label, fallback.links[j]?.label || "Link"),
                }))
              : fallback.links;
          return {
            title: asString(col?.title, fallback.title),
            links,
          };
        })
      : d.footer.columns;

  return {
    hero: {
      badge: asString(heroIn.badge, d.hero.badge),
      brandLine: asString(heroIn.brandLine, d.hero.brandLine),
      typewriterPhrases: asStringArray(
        heroIn.typewriterPhrases,
        d.hero.typewriterPhrases,
      ),
      typewriterPrefix: asString(heroIn.typewriterPrefix, d.hero.typewriterPrefix),
      typewriterSuffix: asString(heroIn.typewriterSuffix, d.hero.typewriterSuffix),
      subtitle: asString(heroIn.subtitle, d.hero.subtitle),
      primaryCtaLabel: asString(heroIn.primaryCtaLabel, d.hero.primaryCtaLabel),
      primaryCtaHref: asString(heroIn.primaryCtaHref, d.hero.primaryCtaHref),
      secondaryCtaLabel: asString(
        heroIn.secondaryCtaLabel,
        d.hero.secondaryCtaLabel,
      ),
      secondaryCtaHref: asString(
        heroIn.secondaryCtaHref,
        d.hero.secondaryCtaHref,
      ),
    },
    features: {
      eyebrow: asString(featuresIn.eyebrow, d.features.eyebrow),
      title: asString(featuresIn.title, d.features.title),
      subtitle: asString(featuresIn.subtitle, d.features.subtitle),
      items: featureItems,
    },
    pricing: {
      eyebrow: asString(pricingIn.eyebrow, d.pricing.eyebrow),
      title: asString(pricingIn.title, d.pricing.title),
      subtitle: asString(pricingIn.subtitle, d.pricing.subtitle),
      plans,
    },
    testimonials: {
      eyebrow: asString(testimonialsIn.eyebrow, d.testimonials.eyebrow),
      title: asString(testimonialsIn.title, d.testimonials.title),
      items: testimonials,
    },
    cta: {
      title: asString(ctaIn.title, d.cta.title),
      subtitle: asString(ctaIn.subtitle, d.cta.subtitle),
      buttonLabel: asString(ctaIn.buttonLabel, d.cta.buttonLabel),
      buttonHref: asString(ctaIn.buttonHref, d.cta.buttonHref),
    },
    footer: {
      brandSubline: asString(footerIn.brandSubline, d.footer.brandSubline),
      description: asString(footerIn.description, d.footer.description),
      copyrightNote: asString(footerIn.copyrightNote, d.footer.copyrightNote),
      columns,
    },
  };
}
