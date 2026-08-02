import {
  planIncludesCustomDomain,
  type PlanId,
} from "@/lib/constants";
import {
  resolveFeatures,
  type IUserFeatures,
} from "@/types/platform.types";

export type CustomDomainApprovalStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected";

/** Normalize legacy statuses (verified/failed) into the approval model */
export function normalizeDomainStatus(
  status?: string | null,
): CustomDomainApprovalStatus {
  if (status === "verified" || status === "approved" || status === "active") {
    return "approved";
  }
  if (status === "failed" || status === "rejected") return "rejected";
  if (status === "pending") return "pending";
  return "none";
}

/**
 * Mapping is live only when Super Admin approved the request AND toggled Active.
 * Legacy `verified` domains are treated as approved+active if active flag missing.
 */
export function isCustomDomainLive(card: {
  customDomain?: string | null;
  customDomainStatus?: string | null;
  customDomainActive?: boolean | null;
}): boolean {
  if (!card.customDomain) return false;
  const status = normalizeDomainStatus(card.customDomainStatus);
  if (status !== "approved") return false;
  if (
    card.customDomainStatus === "verified" &&
    card.customDomainActive == null
  ) {
    return true;
  }
  return card.customDomainActive === true;
}

/**
 * Client may request a domain when Super Admin enabled the privilege AND
 * their plan includes custom domains (Premium by default).
 * Admin can grant Free/Basic users by enabling the feature — that alone is
 * enough when you also treat plan inclusion as optional override via feature.
 *
 * Effective rule: `features.customDomain` must be true.
 * Plans that include custom domains (Premium) default that flag on create/edit.
 */
export function canRequestCustomDomain(
  features?: Partial<IUserFeatures> | null,
  plan?: string | null,
): { allowed: boolean; reason?: string; planIncludes: boolean } {
  const f = resolveFeatures(features);
  const planIncludes = planIncludesCustomDomain(plan);

  if (!f.customDomain) {
    return {
      allowed: false,
      planIncludes,
      reason: planIncludes
        ? "Custom Domain is disabled for your account. Contact Super Admin to enable it."
        : "Custom domains are not included in your plan and have not been enabled by Super Admin.",
    };
  }

  // Admin enabled privilege — allow even if plan matrix is false (account override)
  return { allowed: true, planIncludes };
}

export function defaultCustomDomainFeatureForPlan(
  plan?: string | null,
): boolean {
  return planIncludesCustomDomain(plan);
}

export function featuresForNewUser(
  plan: PlanId | string,
  override?: Partial<IUserFeatures>,
): IUserFeatures {
  const base = resolveFeatures(override);
  return {
    ...base,
    customDomain:
      override?.customDomain ?? defaultCustomDomainFeatureForPlan(plan),
  };
}
