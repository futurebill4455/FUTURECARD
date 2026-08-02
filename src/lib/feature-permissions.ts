import type { ICard } from "@/types/card.types";
import type { IUserFeatures } from "@/types/platform.types";
import { resolveFeatures } from "@/types/platform.types";
import type { ActionButtonKey } from "@/types/card.types";

/** Strip / hide card data that the Super Admin disabled for this tenant */
export function applyFeaturesToCard(
  card: ICard,
  rawFeatures?: Partial<IUserFeatures> | null,
): ICard {
  const features = resolveFeatures(rawFeatures);
  const next: ICard = { ...card };

  if (!features.verifiedBadge) next.isVerified = false;
  if (!features.services) next.services = [];
  if (!features.gallery) {
    next.galleryImages = [];
    next.galleryVideos = [];
  }
  if (!features.payment) next.paymentInfo = undefined;
  if (!features.bankAndBrochures) next.bankDetails = undefined;

  if (!features.socialLinks && next.socialLinks) {
    next.socialLinks = {
      ...next.socialLinks,
      facebook: "",
      instagram: "",
      youtube: "",
      linkedin: "",
      twitter: "",
    };
  }

  if (next.actionButtons?.length) {
    next.actionButtons = next.actionButtons.map((b) => {
      const key = b.key as ActionButtonKey;
      if (!features.inquiryForm && key === "form") {
        return { ...b, enabled: false };
      }
      if (
        !features.socialLinks &&
        ["facebook", "instagram", "youtube", "linkedin", "twitter"].includes(
          key,
        )
      ) {
        return { ...b, enabled: false };
      }
      if (
        !features.bankAndBrochures &&
        (key === "bank" || key === "brochures")
      ) {
        return { ...b, enabled: false };
      }
      return b;
    });
  }

  return next;
}

export function isActionAllowed(
  key: string,
  features?: IUserFeatures | null,
): boolean {
  const f = resolveFeatures(features);
  if (key === "form") return f.inquiryForm;
  if (
    ["facebook", "instagram", "youtube", "linkedin", "twitter"].includes(key)
  ) {
    return f.socialLinks;
  }
  if (key === "bank" || key === "brochures") return f.bankAndBrochures;
  return true;
}
