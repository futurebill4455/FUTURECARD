import type { ICard } from "@/types/card.types";
import type { IUser } from "@/types/user.types";
import type { ISubscription } from "@/types/subscription.types";
import type { IPlatformSettings } from "@/types/platform.types";
import {
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_USER_FEATURES,
  DEFAULT_USER_LIMITS,
  resolveFeatures,
  resolveMaxCardsLimit,
} from "@/types/platform.types";
import {
  DEFAULT_BANK_DETAILS,
  DEFAULT_PAYMENT_INFO,
  DEFAULT_THEME,
} from "@/types/card.types";
import { resolveCardSections } from "@/types/card-sections.types";
import { resolveCardProfileType } from "@/types/card-profile.types";
import { resolveLandingCms } from "@/types/landing-cms.types";
import { getDefaultCnameTarget } from "@/lib/custom-domain";

/** Raw `users` row (snake_case) */
export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  role: "user" | "admin";
  avatar: string | null;
  is_active: boolean;
  is_approved?: boolean | null;
  features: Record<string, boolean> | null;
  card_sections?: Record<string, boolean> | null;
  max_cards_limit?: number | null;
  limits: Record<string, number> | null;
  created_at: string;
  updated_at: string;
};

/** Raw `cards` row */
export type CardRow = {
  id: string;
  user_id: string;
  username: string;
  profile_image: string | null;
  cover_image: string | null;
  background_media_type: string | null;
  background_images: string[] | null;
  background_video: string | null;
  company_name: string;
  job_title: string;
  business_type: string | null;
  business_category: string | null;
  about_us: string | null;
  gst_number: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  location: Record<string, unknown> | null;
  business_hours: unknown[] | null;
  theme: Record<string, string> | null;
  primary_ctas: unknown[] | null;
  extra_links: Record<string, string> | null;
  gallery_images: string[] | null;
  services: unknown[] | null;
  payment_info: Record<string, string> | null;
  bank_details: Record<string, string> | null;
  gallery_videos: string[] | null;
  action_buttons: unknown[] | null;
  is_verified: boolean | null;
  custom_domain: string | null;
  custom_domain_status: string | null;
  custom_domain_active: boolean | null;
  custom_domain_requested_at: string | null;
  custom_domain_reviewed_at: string | null;
  is_active: boolean;
  template: string;
  profile_type?: string | null;
  features_enabled?: Record<string, boolean> | null;
  background_animation_slug?: string | null;
  background_slideshow_images?: string[] | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: "free" | "basic" | "premium";
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_renew: boolean;
  payment_status: "pending" | "paid" | "expired" | "cancelled";
  amount: number | null;
  created_at: string;
  updated_at: string;
};

export type PlatformSettingsRow = {
  id: string;
  key: string;
  admin_whatsapp_number: string | null;
  company_website_url: string | null;
  company_name: string | null;
  footer_tagline: string | null;
  platform_cname_target: string | null;
  ambient_mode?: string | null;
  ambient_video?: string | null;
  ambient_images?: string[] | null;
  landing_cms?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export function mapUser(
  row: UserRow,
  opts?: { includePassword?: boolean },
): IUser {
  const maxCardsLimit = resolveMaxCardsLimit({
    maxCardsLimit: row.max_cards_limit,
    limits: row.limits as { maxCards?: number } | null,
  });
  const user: IUser = {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone?.trim() || undefined,
    role: row.role,
    avatar: row.avatar ?? undefined,
    isActive: row.is_active,
    isApproved:
      row.role === "admin" ? true : row.is_approved !== false,
    features: resolveFeatures(row.features),
    cardSections: resolveCardSections(row.card_sections),
    maxCardsLimit,
    limits: {
      maxCards: maxCardsLimit,
      maxServices: row.limits?.maxServices ?? DEFAULT_USER_LIMITS.maxServices,
      maxGalleryImages:
        row.limits?.maxGalleryImages ?? DEFAULT_USER_LIMITS.maxGalleryImages,
      maxGalleryVideos:
        row.limits?.maxGalleryVideos ?? DEFAULT_USER_LIMITS.maxGalleryVideos,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (opts?.includePassword) user.password = row.password;
  return user;
}

export function mapSubscription(row: SubscriptionRow): ISubscription {
  return {
    _id: row.id,
    userId: row.user_id,
    plan: row.plan,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    autoRenew: row.auto_renew,
    paymentStatus: row.payment_status,
    amount: row.amount ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCard(row: CardRow): ICard {
  return {
    _id: row.id,
    userId: row.user_id,
    username: row.username,
    profileImage: row.profile_image ?? undefined,
    coverImage: row.cover_image ?? undefined,
    backgroundMediaType:
      (row.background_media_type as ICard["backgroundMediaType"]) || "none",
    backgroundImages: row.background_images ?? [],
    backgroundVideo: row.background_video ?? undefined,
    companyName: row.company_name ?? "",
    jobTitle: row.job_title ?? "",
    businessType: row.business_type ?? undefined,
    businessCategory: row.business_category ?? undefined,
    aboutUs: row.about_us ?? undefined,
    gstNumber: row.gst_number ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    whatsappNumber: row.whatsapp_number ?? undefined,
    website: row.website ?? undefined,
    socialLinks: (row.social_links as ICard["socialLinks"]) ?? {},
    location: (row.location as ICard["location"]) ?? {},
    businessHours: (row.business_hours as ICard["businessHours"]) ?? [],
    theme: {
      ...DEFAULT_THEME,
      ...(row.theme || {}),
    },
    primaryCtas: (row.primary_ctas as ICard["primaryCtas"]) ?? [],
    extraLinks: (row.extra_links as ICard["extraLinks"]) ?? {},
    galleryImages: row.gallery_images ?? [],
    services: (row.services as ICard["services"]) ?? [],
    paymentInfo: {
      ...DEFAULT_PAYMENT_INFO,
      ...(row.payment_info || {}),
    },
    bankDetails: {
      ...DEFAULT_BANK_DETAILS,
      ...(row.bank_details || {}),
    },
    galleryVideos: row.gallery_videos ?? [],
    actionButtons: (row.action_buttons as ICard["actionButtons"]) ?? [],
    isVerified: Boolean(row.is_verified),
    customDomain: row.custom_domain ?? undefined,
    customDomainStatus:
      (row.custom_domain_status as ICard["customDomainStatus"]) || "none",
    customDomainActive: Boolean(row.custom_domain_active),
    customDomainRequestedAt: row.custom_domain_requested_at ?? undefined,
    customDomainReviewedAt: row.custom_domain_reviewed_at ?? undefined,
    isActive: row.is_active,
    template: row.template || "classic",
    profileType: resolveCardProfileType(row.profile_type),
    featuresEnabled: resolveCardSections(row.features_enabled),
    backgroundAnimationSlug: row.background_animation_slug || undefined,
    backgroundSlideshowImages: Array.isArray(row.background_slideshow_images)
      ? row.background_slideshow_images.filter(
          (v): v is string => typeof v === "string" && Boolean(v),
        )
      : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseAmbientImages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string" && Boolean(v)).slice(0, 3);
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parseAmbientImages(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

export function mapPlatformSettings(row: PlatformSettingsRow): IPlatformSettings {
  const images = parseAmbientImages(row.ambient_images);
  const mode = row.ambient_mode;
  return {
    _id: row.id,
    adminWhatsappNumber:
      row.admin_whatsapp_number ||
      DEFAULT_PLATFORM_SETTINGS.adminWhatsappNumber,
    companyWebsiteUrl:
      row.company_website_url || DEFAULT_PLATFORM_SETTINGS.companyWebsiteUrl,
    companyName: row.company_name || DEFAULT_PLATFORM_SETTINGS.companyName,
    footerTagline:
      row.footer_tagline || DEFAULT_PLATFORM_SETTINGS.footerTagline,
    platformCnameTarget:
      row.platform_cname_target ||
      getDefaultCnameTarget() ||
      DEFAULT_PLATFORM_SETTINGS.platformCnameTarget,
    ambientMode:
      mode === "video" || mode === "slideshow" || mode === "gradient"
        ? mode
        : "gradient",
    ambientVideo: row.ambient_video || "",
    ambientImages: images,
    landingCms: resolveLandingCms(
      row.landing_cms as Parameters<typeof resolveLandingCms>[0],
    ),
    updatedAt: row.updated_at,
  };
}

/** Map camelCase card payload (from Zod) → snake_case insert/update row */
export function cardPayloadToRow(
  payload: Record<string, unknown>,
  extras?: { user_id?: string },
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  const map: Record<string, string> = {
    username: "username",
    profileImage: "profile_image",
    coverImage: "cover_image",
    backgroundMediaType: "background_media_type",
    backgroundImages: "background_images",
    backgroundVideo: "background_video",
    companyName: "company_name",
    jobTitle: "job_title",
    businessType: "business_type",
    businessCategory: "business_category",
    aboutUs: "about_us",
    gstNumber: "gst_number",
    email: "email",
    phone: "phone",
    whatsappNumber: "whatsapp_number",
    website: "website",
    socialLinks: "social_links",
    location: "location",
    businessHours: "business_hours",
    theme: "theme",
    primaryCtas: "primary_ctas",
    extraLinks: "extra_links",
    galleryImages: "gallery_images",
    services: "services",
    paymentInfo: "payment_info",
    bankDetails: "bank_details",
    galleryVideos: "gallery_videos",
    actionButtons: "action_buttons",
    isVerified: "is_verified",
    customDomain: "custom_domain",
    customDomainStatus: "custom_domain_status",
    customDomainActive: "custom_domain_active",
    customDomainRequestedAt: "custom_domain_requested_at",
    customDomainReviewedAt: "custom_domain_reviewed_at",
    isActive: "is_active",
    template: "template",
    profileType: "profile_type",
    featuresEnabled: "features_enabled",
    backgroundAnimationSlug: "background_animation_slug",
    backgroundSlideshowImages: "background_slideshow_images",
  };

  for (const [camel, snake] of Object.entries(map)) {
    if (payload[camel] !== undefined) {
      row[snake] = payload[camel];
    }
  }

  if (extras?.user_id) row.user_id = extras.user_id;
  if (typeof row.username === "string") {
    row.username = row.username.toLowerCase();
  }

  return row;
}

export { DEFAULT_USER_FEATURES, DEFAULT_USER_LIMITS };
