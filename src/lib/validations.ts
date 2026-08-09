import { z } from "zod";
import { DAYS } from "./constants";
import { CARD_SECTION_KEYS } from "@/types/card-sections.types";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/** Mobile for signup — required, 10–15 digits after stripping non-digits */
export const mobilePhoneRequiredSchema = z
  .string({ required_error: "Mobile number is required" })
  .trim()
  .min(1, "Mobile number is required")
  .max(20, "Mobile number is too long")
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Enter a valid mobile number (10–15 digits)");

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: mobilePhoneRequiredSchema,
});

/** Self-service profile update (display name + email + optional password change) */
export const profileUpdateSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    currentPassword: z.string().min(1).optional().or(z.literal("")),
    newPassword: z.string().min(8).max(72).optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const changingPassword = Boolean(data.newPassword);
    if (changingPassword) {
      if (!data.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current password is required to set a new password",
          path: ["currentPassword"],
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "New passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }
  });

export const userFeaturesSchema = z.object({
  services: z.boolean(),
  payment: z.boolean(),
  gallery: z.boolean(),
  inquiryForm: z.boolean(),
  socialLinks: z.boolean(),
  bankAndBrochures: z.boolean(),
  analytics: z.boolean().optional(),
  customTheme: z.boolean().optional(),
  verifiedBadge: z.boolean().optional(),
  customDomain: z.boolean().optional(),
});

export const cardSectionsSchema = z.object(
  Object.fromEntries(
    CARD_SECTION_KEYS.map((key) => [key, z.boolean()]),
  ) as Record<(typeof CARD_SECTION_KEYS)[number], z.ZodBoolean>,
);

export const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["user", "admin"]).default("user"),
  plan: z.enum(["free", "basic", "premium"]).default("basic"),
  years: z.number().int().min(1).max(5).default(1),
  /** Custom validity in days (overrides years × plan days when set) */
  customDays: z.number().int().min(1).max(3650).optional(),
  features: userFeaturesSchema.optional(),
  cardSections: cardSectionsSchema.optional(),
  maxCardsLimit: z.number().int().min(1).max(50).optional(),
});

export const platformSettingsSchema = z.object({
  adminWhatsappNumber: z.string().max(32).optional().or(z.literal("")),
  companyWebsiteUrl: z.string().max(300).optional().or(z.literal("")),
  companyName: z.string().max(120).optional().or(z.literal("")),
  footerTagline: z.string().max(200).optional().or(z.literal("")),
  platformCnameTarget: z.string().max(253).optional().or(z.literal("")),
  ambientMode: z.enum(["gradient", "video", "slideshow"]).optional(),
  ambientVideo: z.string().max(800).optional().or(z.literal("")),
  ambientImages: z.array(z.string().url().or(z.string().min(1))).max(3).optional(),
  landingCms: z.record(z.unknown()).optional(),
});

const landingFeatureIconSchema = z.enum([
  "badge",
  "package",
  "qr",
  "images",
  "globe",
  "shield",
]);

export const landingCmsSchema = z.object({
  hero: z.object({
    badge: z.string().max(120),
    brandLine: z.string().max(80),
    typewriterPhrases: z.array(z.string().max(120)).min(1).max(8),
    typewriterPrefix: z.string().max(80),
    typewriterSuffix: z.string().max(80),
    subtitle: z.string().max(500),
    primaryCtaLabel: z.string().max(60),
    primaryCtaHref: z.string().max(300),
    secondaryCtaLabel: z.string().max(60),
    secondaryCtaHref: z.string().max(300),
  }),
  features: z.object({
    eyebrow: z.string().max(60),
    title: z.string().max(160),
    subtitle: z.string().max(400),
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(40),
          title: z.string().max(80),
          description: z.string().max(300),
          icon: landingFeatureIconSchema,
          wide: z.boolean().optional(),
        }),
      )
      .min(1)
      .max(12),
  }),
  pricing: z.object({
    eyebrow: z.string().max(60),
    title: z.string().max(160),
    subtitle: z.string().max(400),
    plans: z
      .array(
        z.object({
          id: z.string().min(1).max(40),
          name: z.string().max(60),
          blurb: z.string().max(200),
          monthly: z.number().min(0).max(1_000_000),
          yearly: z.number().min(0).max(1_000_000),
          popular: z.boolean().optional(),
          features: z.array(z.string().max(120)).min(1).max(20),
          ctaLabel: z.string().max(60),
          ctaHref: z.string().max(300),
        }),
      )
      .min(1)
      .max(6),
  }),
  testimonials: z.object({
    eyebrow: z.string().max(60),
    title: z.string().max(160),
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(40),
          name: z.string().max(80),
          role: z.string().max(120),
          quote: z.string().max(600),
        }),
      )
      .min(1)
      .max(12),
  }),
  cta: z.object({
    title: z.string().max(160),
    subtitle: z.string().max(300),
    buttonLabel: z.string().max(60),
    buttonHref: z.string().max(300),
  }),
  footer: z.object({
    brandSubline: z.string().max(120),
    description: z.string().max(400),
    copyrightNote: z.string().max(200),
    columns: z
      .array(
        z.object({
          title: z.string().max(60),
          links: z
            .array(
              z.object({
                href: z.string().max(300),
                label: z.string().max(60),
              }),
            )
            .min(1)
            .max(10),
        }),
      )
      .min(1)
      .max(6),
  }),
});

export const landingCmsUpdateSchema = z.object({
  landingCms: landingCmsSchema,
});

export const customDomainSchema = z.object({
  customDomain: z
    .string()
    .max(253)
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
      "Enter a valid domain (e.g. card.mybusiness.com)",
    )
    .or(z.literal("")),
});

export const userLimitsSchema = z.object({
  maxCards: z.number().int().min(1).max(50),
  maxServices: z.number().int().min(0).max(50),
  maxGalleryImages: z.number().int().min(0).max(48),
  maxGalleryVideos: z.number().int().min(0).max(24),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  isActive: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
  features: userFeaturesSchema.optional(),
  cardSections: cardSectionsSchema.optional(),
  /** Authoritative card create cap (synced to limits.maxCards) */
  maxCardsLimit: z.number().int().min(1).max(50).optional(),
  limits: userLimitsSchema.optional(),
  plan: z.enum(["free", "basic", "premium"]).optional(),
  /** Set absolute end date (ISO) */
  endDate: z.string().datetime().optional().or(z.string().min(8).optional()),
  /** Extend from now or current end by N days */
  renewDays: z.number().int().min(1).max(3650).optional(),
  renewYears: z.number().int().min(1).max(5).optional(),
  paymentStatus: z
    .enum(["pending", "paid", "expired", "cancelled"])
    .optional(),
});

export const businessHourSchema = z.object({
  day: z.enum(DAYS as [string, ...string[]]),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
});

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color");

export const cardSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscore"),
  companyName: z.string().min(1).max(100),
  jobTitle: z.string().min(1).max(100),
  businessType: z.string().max(120).optional().or(z.literal("")),
  businessCategory: z.string().max(120).optional().or(z.literal("")),
  aboutUs: z.string().max(1500).optional().or(z.literal("")),
  gstNumber: z.string().max(32).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(32).optional().or(z.literal("")),
  whatsappNumber: z.string().max(32).optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  profileImage: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  backgroundMediaType: z.enum(["none", "slideshow", "video"]).optional(),
  backgroundImages: z.array(z.string()).max(4).optional(),
  backgroundVideo: z.string().optional().or(z.literal("")),
  socialLinks: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      other: z.string().optional(),
    })
    .optional(),
  location: z
    .object({
      address: z.string().optional(),
      googleMapsUrl: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
  businessHours: z.array(businessHourSchema).optional(),
  theme: z
    .object({
      backgroundColor: hexColor,
      headerColor: hexColor,
      buttonColor: hexColor,
    })
    .optional(),
  primaryCtas: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1).max(40),
        url: z.string().optional().or(z.literal("")),
        enabled: z.boolean(),
      }),
    )
    .max(6)
    .optional(),
  extraLinks: z
    .object({
      bank: z.string().optional(),
      videos: z.string().optional(),
      brochures: z.string().optional(),
      bookNow: z.string().optional(),
      form: z.string().optional(),
      review: z.string().optional(),
      services: z.string().optional(),
      payNow: z.string().optional(),
    })
    .optional(),
  galleryImages: z.array(z.string()).max(24).optional(),
  services: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1).max(120),
        price: z.string().max(60).optional().or(z.literal("")),
        description: z.string().max(1000).optional().or(z.literal("")),
        image: z.string().optional().or(z.literal("")),
      }),
    )
    .max(10)
    .optional(),
  paymentInfo: z
    .object({
      qrCodeImage: z.string().optional().or(z.literal("")),
      upiId: z.string().max(120).optional().or(z.literal("")),
      upiMobile: z.string().max(20).optional().or(z.literal("")),
    })
    .optional(),
  bankDetails: z
    .object({
      accountName: z.string().max(120).optional().or(z.literal("")),
      accountNumber: z.string().max(40).optional().or(z.literal("")),
      ifscCode: z.string().max(20).optional().or(z.literal("")),
      bankName: z.string().max(120).optional().or(z.literal("")),
      branch: z.string().max(120).optional().or(z.literal("")),
    })
    .optional(),
  galleryVideos: z.array(z.string()).max(12).optional(),
  actionButtons: z
    .array(
      z.object({
        key: z.string().min(1),
        enabled: z.boolean(),
        value: z.string().max(500).optional().or(z.literal("")),
      }),
    )
    .max(24)
    .optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  template: z.string().optional(),
  /** Per-card section visibility prefs (user level) */
  featuresEnabled: cardSectionsSchema.optional(),
});

export const subscriptionUpdateSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["free", "basic", "premium"]).optional(),
  paymentStatus: z
    .enum(["pending", "paid", "expired", "cancelled"])
    .optional(),
  renewYears: z.number().int().min(1).max(5).optional(),
  renewDays: z.number().int().min(1).max(3650).optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  amount: z.number().optional(),
});

/** Admin-only subscribe / unsubscribe toggle */
export const subscriptionToggleSchema = z.object({
  subscribed: z.boolean(),
});

export type CardInput = z.infer<typeof cardSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
