import { z } from "zod";
import { DAYS } from "./constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
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
});

export const platformSettingsSchema = z.object({
  adminWhatsappNumber: z.string().max(32).optional().or(z.literal("")),
  companyWebsiteUrl: z.string().max(300).optional().or(z.literal("")),
  companyName: z.string().max(120).optional().or(z.literal("")),
  footerTagline: z.string().max(200).optional().or(z.literal("")),
  platformCnameTarget: z.string().max(253).optional().or(z.literal("")),
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

export type CardInput = z.infer<typeof cardSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
