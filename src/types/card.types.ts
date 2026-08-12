export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type BackgroundMediaType = "none" | "slideshow" | "video";

export interface ISocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  other?: string;
}

export interface ILocation {
  address?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface IBusinessHour {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface IThemeColors {
  /** Page / outer background */
  backgroundColor: string;
  /** Header / cover accent */
  headerColor: string;
  /** Primary CTA + icon accents */
  buttonColor: string;
}

export interface IPrimaryCta {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface IExtraLinks {
  bank?: string;
  videos?: string;
  brochures?: string;
  bookNow?: string;
  form?: string;
  review?: string;
  services?: string;
  payNow?: string;
}

export interface IServiceItem {
  id: string;
  title: string;
  price: string;
  description: string;
  image?: string;
}

/** UPI / Pay Now details shown in the public payment modal */
export interface IPaymentInfo {
  /** Uploaded payment QR code image URL */
  qrCodeImage?: string;
  /** e.g. business@upi */
  upiId?: string;
  /** Mobile number linked to UPI */
  upiMobile?: string;
}

/** Single bank account shown in the Bank action modal */
export interface IBankDetails {
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
}

export const DEFAULT_PAYMENT_INFO: IPaymentInfo = {
  qrCodeImage: "",
  upiId: "",
  upiMobile: "",
};

export const DEFAULT_BANK_DETAILS: IBankDetails = {
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branch: "",
};

/** Mini-site stats / counters row (Years, Clients, Partners, Support, …) */
export interface ICardStat {
  id: string;
  /** Numeric value used for count-up animation */
  value: number;
  /** Appended after the animated number (e.g. "+") */
  suffix?: string;
  label: string;
  /** When set, shown as-is instead of animating `value` (e.g. "24/7") */
  display?: string;
}

export const DEFAULT_CARD_STATS: ICardStat[] = [
  { id: "years", value: 5, suffix: "+", label: "Years of Experience" },
  { id: "clients", value: 500, suffix: "+", label: "Happy Clients" },
  { id: "partners", value: 20, suffix: "+", label: "Partner Companies" },
  { id: "support", value: 24, display: "24/7", label: "Support Available" },
];

/** Merge saved stats with defaults by id (keeps 4 core counters stable). */
export function resolveCardStats(
  raw?: ICardStat[] | null,
): ICardStat[] {
  const byId = new Map<string, ICardStat>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const id = String(item.id || "").trim();
      if (!id) continue;
      const value = Number(item.value);
      byId.set(id, {
        id,
        value: Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0,
        suffix:
          typeof item.suffix === "string" ? item.suffix.slice(0, 8) : undefined,
        label: String(item.label || "").trim().slice(0, 60) || id,
        display:
          typeof item.display === "string" && item.display.trim()
            ? item.display.trim().slice(0, 24)
            : undefined,
      });
    }
  }

  return DEFAULT_CARD_STATS.map((def) => {
    const override = byId.get(def.id);
    if (!override) return { ...def };
    return {
      ...def,
      ...override,
      id: def.id,
      label: override.label || def.label,
    };
  });
}

/** “Why choose us” grid item on the public mini-site */
export interface IWhyChooseItem {
  id: string;
  title: string;
  description: string;
  /** When false, hidden on the public card (default true) */
  enabled: boolean;
}

export const DEFAULT_WHY_CHOOSE_ITEMS: IWhyChooseItem[] = [
  {
    id: "client-first",
    title: "Client First Approach",
    description: "Every recommendation starts with your goals and risk profile.",
    enabled: true,
  },
  {
    id: "transparent",
    title: "Transparent Advice",
    description: "Clear options, honest trade-offs — no pressure tactics.",
    enabled: true,
  },
  {
    id: "best-options",
    title: "Best Options",
    description: "Curated plans across segments so you choose with confidence.",
    enabled: true,
  },
  {
    id: "claims",
    title: "Claim Assistance",
    description: "Hands-on support when you need documentation and follow-ups.",
    enabled: true,
  },
  {
    id: "after-sales",
    title: "After Sales Support",
    description: "Ongoing guidance after purchase — not just at signup.",
    enabled: true,
  },
  {
    id: "relationship",
    title: "Long Term Relationship",
    description: "A lasting partnership for protection, growth, and beyond.",
    enabled: true,
  },
];

/** Merge saved why-choose items with the 6 default slots. */
export function resolveWhyChooseItems(
  raw?: IWhyChooseItem[] | null,
): IWhyChooseItem[] {
  const byId = new Map<string, IWhyChooseItem>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const id = String(item.id || "").trim();
      if (!id) continue;
      byId.set(id, {
        id,
        title: String(item.title || "").trim().slice(0, 80) || id,
        description: String(item.description || "").trim().slice(0, 400),
        enabled: item.enabled !== false,
      });
    }
  }

  return DEFAULT_WHY_CHOOSE_ITEMS.map((def) => {
    const override = byId.get(def.id);
    if (!override) return { ...def };
    return {
      ...def,
      title: override.title || def.title,
      description:
        override.description !== undefined
          ? override.description
          : def.description,
      enabled: override.enabled,
    };
  });
}

export const ACTION_BUTTON_KEYS = [
  "call",
  "whatsapp",
  "email",
  "website",
  "bank",
  "address",
  "videos",
  "brochures",
  "bookNow",
  "form",
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "twitter",
  "review",
  "qr",
  "install",
] as const;

export type ActionButtonKey = (typeof ACTION_BUTTON_KEYS)[number];

export interface IActionButton {
  key: ActionButtonKey;
  enabled: boolean;
  value: string;
}

export const DEFAULT_THEME: IThemeColors = {
  backgroundColor: "#FFF1F2",
  headerColor: "#BE123C",
  buttonColor: "#E11D48",
};

/** Top quick-action bar (4 buttons) */
export const DEFAULT_PRIMARY_CTAS: IPrimaryCta[] = [
  { id: "save", label: "Save Contact", url: "", enabled: true },
  { id: "services", label: "View Service", url: "", enabled: true },
  { id: "book", label: "Book Appointment", url: "", enabled: true },
  { id: "pay", label: "Pay Now (UPI)", url: "", enabled: true },
];

export interface ICard {
  _id: string;
  userId: string;
  username: string;
  profileImage?: string;
  coverImage?: string;
  backgroundMediaType?: BackgroundMediaType;
  backgroundImages?: string[];
  backgroundVideo?: string;
  companyName: string;
  jobTitle: string;
  /** e.g. Wholesale & Retail */
  businessType?: string;
  businessCategory?: string;
  aboutUs?: string;
  gstNumber?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  website?: string;
  socialLinks?: ISocialLinks;
  location?: ILocation;
  businessHours?: IBusinessHour[];
  theme?: IThemeColors;
  primaryCtas?: IPrimaryCta[];
  extraLinks?: IExtraLinks;
  galleryImages?: string[];
  /** Up to 10 services / products */
  services?: IServiceItem[];
  /** Pay Now modal: QR + UPI details */
  paymentInfo?: IPaymentInfo;
  /** Bank account details for Bank action modal */
  bankDetails?: IBankDetails;
  /** Short videos for Video Gallery */
  galleryVideos?: string[];
  /** Per-button visibility + values for the action icon grid */
  actionButtons?: IActionButton[];
  /** Show Instagram-style verified blue tick next to company name */
  isVerified?: boolean;
  /** Hostname mapped to this card (no protocol), e.g. card.mybusiness.com */
  customDomain?: string;
  /** Super Admin approval: none | pending | approved | rejected */
  customDomainStatus?: "none" | "pending" | "approved" | "rejected";
  /** Only Super Admin can set true; mapping works when approved AND active */
  customDomainActive?: boolean;
  customDomainRequestedAt?: string;
  customDomainReviewedAt?: string;
  isActive: boolean;
  /** Legacy theme/layout key (classic, etc.) */
  template: string;
  /**
   * Super Admin–controlled public mini-site profile type.
   * individual | business | shop
   */
  profileType?: import("./card-profile.types").CardProfileType;
  /**
   * Per-card section prefs (user level).
   * Only sections allowed by the owner's admin `cardSections` can appear.
   */
  featuresEnabled?: import("./card-sections.types").ICardSections;
  /**
   * Mini-site background animation slug from admin catalog
   * (e.g. design_a_particles).
   */
  backgroundAnimationSlug?: string;
  /** 2–5 images for Photo Slideshow background (mini-site) */
  backgroundSlideshowImages?: string[];
  /** Mini-site stats counters (years, clients, partners, support) */
  stats?: ICardStat[];
  /** Mini-site “Why choose us” items (title/description + per-item enabled) */
  whyChooseItems?: IWhyChooseItem[];
  createdAt: string;
  updatedAt: string;
}
