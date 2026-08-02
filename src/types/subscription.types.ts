export type SubscriptionPlan = "free" | "basic" | "premium";
export type PaymentStatus = "pending" | "paid" | "expired" | "cancelled";

export interface ISubscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
  paymentStatus: PaymentStatus;
  amount?: number;
  createdAt: string;
  updatedAt: string;
}
