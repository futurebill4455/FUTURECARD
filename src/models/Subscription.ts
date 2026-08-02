import mongoose, { Schema, models, model } from "mongoose";

export interface SubscriptionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  plan: "free" | "basic" | "premium";
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  paymentStatus: "pending" | "paid" | "expired" | "cancelled";
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "expired", "cancelled"],
      default: "pending",
    },
    amount: Number,
  },
  { timestamps: true },
);

export const Subscription =
  models.Subscription ||
  model<SubscriptionDocument>("Subscription", SubscriptionSchema);
