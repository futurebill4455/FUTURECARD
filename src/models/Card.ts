import mongoose, { Schema, models, model } from "mongoose";
import { DAYS } from "@/lib/constants";

export interface CardDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  profileImage?: string;
  coverImage?: string;
  backgroundMediaType?: "none" | "slideshow" | "video";
  backgroundImages?: string[];
  backgroundVideo?: string;
  companyName: string;
  jobTitle: string;
  businessType?: string;
  businessCategory?: string;
  aboutUs?: string;
  gstNumber?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  website?: string;
  socialLinks?: Record<string, string | undefined>;
  location?: {
    address?: string;
    googleMapsUrl?: string;
    latitude?: number;
    longitude?: number;
  };
  businessHours?: Array<{
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
  theme?: {
    backgroundColor: string;
    headerColor: string;
    buttonColor: string;
  };
  primaryCtas?: Array<{
    id: string;
    label: string;
    url: string;
    enabled: boolean;
  }>;
  extraLinks?: {
    bank?: string;
    videos?: string;
    brochures?: string;
    bookNow?: string;
    form?: string;
    review?: string;
    services?: string;
    payNow?: string;
  };
  galleryImages?: string[];
  services?: Array<{
    id: string;
    title: string;
    price: string;
    description: string;
    image?: string;
  }>;
  paymentInfo?: {
    qrCodeImage?: string;
    upiId?: string;
    upiMobile?: string;
  };
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
  };
  galleryVideos?: string[];
  actionButtons?: Array<{
    key: string;
    enabled: boolean;
    value: string;
  }>;
  isVerified?: boolean;
  /** Custom hostname clients map via CNAME (e.g. card.mybusiness.com) */
  customDomain?: string;
  customDomainStatus?: "none" | "pending" | "approved" | "rejected";
  customDomainActive?: boolean;
  customDomainRequestedAt?: Date;
  customDomainReviewedAt?: Date;
  isActive: boolean;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<CardDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profileImage: String,
    coverImage: String,
    backgroundMediaType: {
      type: String,
      enum: ["none", "slideshow", "video"],
      default: "none",
    },
    backgroundImages: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => !v || v.length <= 4,
        message: "Maximum 4 background images",
      },
    },
    backgroundVideo: String,
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    businessType: String,
    businessCategory: String,
    aboutUs: { type: String, maxlength: 1500 },
    gstNumber: String,
    email: String,
    phone: String,
    whatsappNumber: String,
    website: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      youtube: String,
      linkedin: String,
      twitter: String,
      other: String,
    },
    location: {
      address: String,
      googleMapsUrl: String,
      latitude: Number,
      longitude: Number,
    },
    businessHours: [
      {
        day: { type: String, enum: DAYS },
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
    ],
    theme: {
      backgroundColor: { type: String, default: "#FFF1F2" },
      headerColor: { type: String, default: "#BE123C" },
      buttonColor: { type: String, default: "#E11D48" },
    },
    primaryCtas: [
      {
        id: String,
        label: String,
        url: String,
        enabled: { type: Boolean, default: true },
      },
    ],
    extraLinks: {
      bank: String,
      videos: String,
      brochures: String,
      bookNow: String,
      form: String,
      review: String,
      services: String,
      payNow: String,
    },
    galleryImages: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => !v || v.length <= 24,
        message: "Maximum 24 gallery images",
      },
    },
    services: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          price: { type: String, default: "" },
          description: { type: String, default: "" },
          image: String,
        },
      ],
      default: [],
      validate: {
        validator: (v: unknown[]) => !v || v.length <= 10,
        message: "Maximum 10 services",
      },
    },
    paymentInfo: {
      qrCodeImage: { type: String, default: "" },
      upiId: { type: String, default: "" },
      upiMobile: { type: String, default: "" },
    },
    bankDetails: {
      accountName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
      branch: { type: String, default: "" },
    },
    galleryVideos: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => !v || v.length <= 12,
        message: "Maximum 12 gallery videos",
      },
    },
    actionButtons: {
      type: [
        {
          key: { type: String, required: true },
          enabled: { type: Boolean, default: true },
          value: { type: String, default: "" },
        },
      ],
      default: [],
    },
    isVerified: { type: Boolean, default: false },
    customDomain: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      default: undefined,
    },
    customDomainStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected", "verified", "failed"],
      default: "none",
    },
    customDomainActive: { type: Boolean, default: false },
    customDomainRequestedAt: Date,
    customDomainReviewedAt: Date,
    isActive: { type: Boolean, default: true },
    template: { type: String, default: "classic" },
  },
  { timestamps: true },
);

CardSchema.index({ userId: 1 });

export const Card = models.Card || model<CardDocument>("Card", CardSchema);
