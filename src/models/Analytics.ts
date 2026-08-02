import mongoose, { Schema, models, model } from "mongoose";

export interface AnalyticsDocument extends mongoose.Document {
  cardId: mongoose.Types.ObjectId;
  eventType: "view" | "click" | "action" | "share" | "save_contact";
  eventDetail?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<AnalyticsDocument>(
  {
    cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
    eventType: {
      type: String,
      enum: ["view", "click", "action", "share", "save_contact"],
      required: true,
    },
    eventDetail: String,
    ipAddress: String,
    userAgent: String,
    referrer: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AnalyticsSchema.index({ cardId: 1, createdAt: -1 });
AnalyticsSchema.index({ cardId: 1, eventType: 1 });

export const Analytics =
  models.Analytics || model<AnalyticsDocument>("Analytics", AnalyticsSchema);
