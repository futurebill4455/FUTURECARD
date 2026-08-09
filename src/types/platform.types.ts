export type FeatureKey =
  | "services"
  | "payment"
  | "gallery"
  | "inquiryForm"
  | "socialLinks"
  | "bankAndBrochures"
  | "analytics"
  | "customTheme"
  | "verifiedBadge"
  | "customDomain";

export interface IUserFeatures {
  /** Products / Services section */
  services: boolean;
  /** Pay Now / UPI gateway */
  payment: boolean;
  /** Image & Video galleries */
  gallery: boolean;
  /** Inquiry / contact form action */
  inquiryForm: boolean;
  /** Facebook, Instagram, YouTube, LinkedIn, Twitter */
  socialLinks: boolean;
  /** Bank details modal + Brochures download */
  bankAndBrochures: boolean;
  analytics: boolean;
  customTheme: boolean;
  verifiedBadge: boolean;
  /** Request + use custom domain mapping (admin-gated) */
  customDomain: boolean;
}

/** Legacy fields that may exist on older user documents */
type LegacyFeatures = Partial<IUserFeatures> & {
  videoGallery?: boolean;
  bankDetails?: boolean;
};

export interface IUserLimits {
  maxCards: number;
  maxServices: number;
  maxGalleryImages: number;
  maxGalleryVideos: number;
}

export const DEFAULT_USER_FEATURES: IUserFeatures = {
  services: true,
  payment: true,
  gallery: true,
  inquiryForm: true,
  socialLinks: true,
  bankAndBrochures: true,
  analytics: true,
  customTheme: true,
  verifiedBadge: true,
  customDomain: false,
};

export const DEFAULT_USER_LIMITS: IUserLimits = {
  maxCards: 3,
  maxServices: 10,
  maxGalleryImages: 24,
  maxGalleryVideos: 12,
};

/** Primary checklist shown in Super Admin (create/edit client) */
export const ADMIN_FEATURE_CHECKLIST: {
  key: FeatureKey;
  label: string;
  description: string;
}[] = [
  {
    key: "services",
    label: "Products / Services Section",
    description: "Service catalog, View Service CTA, Inquiry Now",
  },
  {
    key: "payment",
    label: "Payment / UPI Gateway Section",
    description: "Pay Now modal, UPI QR & copy fields",
  },
  {
    key: "gallery",
    label: "Image & Video Gallery",
    description: "Photo grid, shorts gallery, and lightboxes",
  },
  {
    key: "inquiryForm",
    label: "Inquiry & Contact Form",
    description: "Form action → Name, Place, Message via WhatsApp",
  },
  {
    key: "socialLinks",
    label: "Social Media Links",
    description: "Facebook, Instagram, YouTube, LinkedIn, Twitter/X",
  },
  {
    key: "bankAndBrochures",
    label: "Bank Details & Brochures",
    description: "Bank account modal with Copy + PDF brochure download",
  },
  {
    key: "customDomain",
    label: "Custom Domain Mapping",
    description:
      "Allow client to request a custom domain (still needs Super Admin approval)",
  },
];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  services: "Products / Services",
  payment: "Payment / UPI Gateway",
  gallery: "Image & Video Gallery",
  inquiryForm: "Inquiry & Contact Form",
  socialLinks: "Social Media Links",
  bankAndBrochures: "Bank Details & Brochures",
  analytics: "Public Analytics",
  customTheme: "Theme Customizer",
  verifiedBadge: "Verified Blue Tick",
  customDomain: "Custom Domain",
};

/** Normalize stored/legacy feature objects into the current shape */
export function resolveFeatures(raw?: LegacyFeatures | null): IUserFeatures {
  const r = raw || {};
  return {
    services: r.services ?? true,
    payment: r.payment ?? true,
    gallery: r.gallery ?? r.videoGallery ?? true,
    inquiryForm: r.inquiryForm ?? true,
    socialLinks: r.socialLinks ?? true,
    bankAndBrochures: r.bankAndBrochures ?? r.bankDetails ?? true,
    analytics: r.analytics ?? true,
    customTheme: r.customTheme ?? true,
    verifiedBadge: r.verifiedBadge ?? true,
    customDomain: r.customDomain ?? false,
  };
}

export interface IPlatformSettings {
  _id?: string;
  adminWhatsappNumber: string;
  companyWebsiteUrl: string;
  companyName: string;
  footerTagline: string;
  /** Hostname clients point CNAME records to */
  platformCnameTarget: string;
  /** Shell ambient background for dashboards, landing, and public cards */
  ambientMode?: "gradient" | "video" | "slideshow";
  ambientVideo?: string;
  ambientImages?: string[];
  updatedAt?: string;
}

export const DEFAULT_PLATFORM_SETTINGS: IPlatformSettings = {
  adminWhatsappNumber: "+919876543210",
  companyWebsiteUrl: "https://futureshield.pro",
  companyName: "Future Shield",
  footerTagline: "Verified digital visiting cards by Future Shield",
  platformCnameTarget: "app.futurecard.pro",
  ambientMode: "gradient",
  ambientVideo: "",
  ambientImages: [],
};
