import mongoose, { Schema, models, model } from "mongoose";

export interface PlatformSettingsDocument extends mongoose.Document {
  key: string;
  adminWhatsappNumber: string;
  companyWebsiteUrl: string;
  companyName: string;
  footerTagline: string;
  /** Hostname clients should CNAME to (e.g. app.futurecard.pro) */
  platformCnameTarget: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<PlatformSettingsDocument>(
  {
    key: { type: String, default: "default", unique: true },
    adminWhatsappNumber: { type: String, default: "" },
    companyWebsiteUrl: { type: String, default: "" },
    companyName: { type: String, default: "FutureCard" },
    footerTagline: {
      type: String,
      default: "Create your own digital visiting card",
    },
    platformCnameTarget: {
      type: String,
      default: "app.futurecard.pro",
    },
  },
  { timestamps: true },
);

export const PlatformSettings =
  models.PlatformSettings ||
  model<PlatformSettingsDocument>("PlatformSettings", PlatformSettingsSchema);
