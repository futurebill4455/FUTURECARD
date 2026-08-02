import mongoose, { Schema, models, model } from "mongoose";
import {
  DEFAULT_USER_FEATURES,
  DEFAULT_USER_LIMITS,
} from "@/types/platform.types";

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  avatar?: string;
  isActive: boolean;
  features: {
    services: boolean;
    payment: boolean;
    gallery: boolean;
    inquiryForm: boolean;
    socialLinks: boolean;
    bankAndBrochures: boolean;
    analytics: boolean;
    customTheme: boolean;
    verifiedBadge: boolean;
    customDomain: boolean;
    /** @deprecated legacy */
    videoGallery?: boolean;
    bankDetails?: boolean;
  };
  limits: {
    maxCards: number;
    maxServices: number;
    maxGalleryImages: number;
    maxGalleryVideos: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    features: {
      services: { type: Boolean, default: DEFAULT_USER_FEATURES.services },
      payment: { type: Boolean, default: DEFAULT_USER_FEATURES.payment },
      gallery: { type: Boolean, default: DEFAULT_USER_FEATURES.gallery },
      inquiryForm: {
        type: Boolean,
        default: DEFAULT_USER_FEATURES.inquiryForm,
      },
      socialLinks: {
        type: Boolean,
        default: DEFAULT_USER_FEATURES.socialLinks,
      },
      bankAndBrochures: {
        type: Boolean,
        default: DEFAULT_USER_FEATURES.bankAndBrochures,
      },
      analytics: { type: Boolean, default: DEFAULT_USER_FEATURES.analytics },
      customTheme: {
        type: Boolean,
        default: DEFAULT_USER_FEATURES.customTheme,
      },
      verifiedBadge: {
        type: Boolean,
        default: DEFAULT_USER_FEATURES.verifiedBadge,
      },
      customDomain: {
        type: Boolean,
        default: DEFAULT_USER_FEATURES.customDomain,
      },
      // legacy keys kept so old documents still load
      videoGallery: { type: Boolean },
      bankDetails: { type: Boolean },
    },
    limits: {
      maxCards: { type: Number, default: DEFAULT_USER_LIMITS.maxCards },
      maxServices: { type: Number, default: DEFAULT_USER_LIMITS.maxServices },
      maxGalleryImages: {
        type: Number,
        default: DEFAULT_USER_LIMITS.maxGalleryImages,
      },
      maxGalleryVideos: {
        type: Number,
        default: DEFAULT_USER_LIMITS.maxGalleryVideos,
      },
    },
  },
  { timestamps: true },
);

export const User = models.User || model<UserDocument>("User", UserSchema);
