import type { DayOfWeek, IBusinessHour } from "@/types/card.types";

export const APP_NAME = "FutureCard";

export const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DEFAULT_BUSINESS_HOURS: IBusinessHour[] = [
  { day: "Monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Saturday", isOpen: true, openTime: "10:00", closeTime: "14:00" },
  { day: "Sunday", isOpen: false, openTime: "00:00", closeTime: "00:00" },
];

export const RESERVED_USERNAMES = new Set([
  "api",
  "login",
  "register",
  "dashboard",
  "cards",
  "c",
  "analytics",
  "settings",
  "admin",
  "auth",
  "public",
  "domain",
  "_next",
  "favicon.ico",
]);

export const PLAN_LIMITS = {
  free: { maxCards: 1, days: 30 },
  basic: { maxCards: 3, days: 365 },
  premium: { maxCards: 10, days: 365 },
} as const;

/** Which subscription plans include custom-domain capability by default */
export const PLAN_FEATURES = {
  free: { customDomain: false },
  basic: { customDomain: false },
  premium: { customDomain: true },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

export function planIncludesCustomDomain(plan?: string | null): boolean {
  if (!plan) return false;
  const key = plan as PlanId;
  return PLAN_FEATURES[key]?.customDomain ?? false;
}
