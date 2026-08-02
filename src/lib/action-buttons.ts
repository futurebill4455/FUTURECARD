import type {
  ActionButtonKey,
  IActionButton,
  IBankDetails,
  ICard,
  IExtraLinks,
  IPrimaryCta,
  ISocialLinks,
} from "@/types/card.types";
import {
  ACTION_BUTTON_KEYS as KEYS,
  DEFAULT_PRIMARY_CTAS,
} from "@/types/card.types";

export type { ActionButtonKey, IActionButton };
export { KEYS as ACTION_BUTTON_KEYS };

export type ActionValueKind = "tel" | "email" | "url" | "modal" | "none";

export interface ActionButtonMeta {
  key: ActionButtonKey;
  label: string;
  placeholder: string;
  valueKind: ActionValueKind;
  softBg: string;
  softFg: string;
  hint?: string;
}

export const ACTION_BUTTON_META: ActionButtonMeta[] = [
  {
    key: "call",
    label: "Call",
    placeholder: "+91 98765 43210",
    valueKind: "tel",
    softBg: "#DBEAFE",
    softFg: "#1D4ED8",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "+91 98765 43210",
    valueKind: "tel",
    softBg: "#DCFCE7",
    softFg: "#15803D",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "hello@business.com",
    valueKind: "email",
    softBg: "#FEE2E2",
    softFg: "#B91C1C",
  },
  {
    key: "website",
    label: "Website",
    placeholder: "https://…",
    valueKind: "url",
    softBg: "#E0E7FF",
    softFg: "#4338CA",
  },
  {
    key: "bank",
    label: "Bank",
    placeholder: "",
    valueKind: "modal",
    softBg: "#FEF3C7",
    softFg: "#B45309",
    hint: "Uses Bank Details below (account name, number, IFSC…). No URL needed.",
  },
  {
    key: "address",
    label: "Address",
    placeholder: "https://maps.google.com/…",
    valueKind: "url",
    softBg: "#FFEDD5",
    softFg: "#C2410C",
  },
  {
    key: "videos",
    label: "Videos",
    placeholder: "https://…",
    valueKind: "url",
    softBg: "#FCE7F3",
    softFg: "#BE185D",
  },
  {
    key: "brochures",
    label: "Brochures",
    placeholder: "https://…/brochure.pdf",
    valueKind: "url",
    softBg: "#E0F2FE",
    softFg: "#0369A1",
    hint: "PDF or document URL — visitors get a direct download.",
  },
  {
    key: "bookNow",
    label: "Book Now",
    placeholder: "https://…",
    valueKind: "url",
    softBg: "#F3E8FF",
    softFg: "#7E22CE",
  },
  {
    key: "form",
    label: "Form",
    placeholder: "",
    valueKind: "modal",
    softBg: "#ECFDF5",
    softFg: "#047857",
    hint: "Opens an inquiry form (Name, Place, Message) sent to your WhatsApp.",
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/…",
    valueKind: "url",
    softBg: "#DBEAFE",
    softFg: "#1D4ED8",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/…",
    valueKind: "url",
    softBg: "#FCE7F3",
    softFg: "#DB2777",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/…",
    valueKind: "url",
    softBg: "#FEE2E2",
    softFg: "#DC2626",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/…",
    valueKind: "url",
    softBg: "#E0F2FE",
    softFg: "#0369A1",
  },
  {
    key: "twitter",
    label: "Twitter/X",
    placeholder: "https://x.com/…",
    valueKind: "url",
    softBg: "#F4F4F5",
    softFg: "#18181B",
  },
  {
    key: "review",
    label: "Review",
    placeholder: "https://g.page/r/…",
    valueKind: "url",
    softBg: "#FEF9C3",
    softFg: "#A16207",
    hint: "Google Review link for customers.",
  },
  {
    key: "qr",
    label: "QR Code",
    placeholder: "",
    valueKind: "none",
    softBg: "#F1F5F9",
    softFg: "#334155",
    hint: "Auto-generates a QR for this card with download.",
  },
  {
    key: "install",
    label: "Install",
    placeholder: "",
    valueKind: "none",
    softBg: "#CCFBF1",
    softFg: "#0F766E",
    hint: "Helps visitors add the card to their home screen.",
  },
];

export function metaFor(key: ActionButtonKey) {
  return ACTION_BUTTON_META.find((m) => m.key === key)!;
}

export function hasBankDetails(details?: IBankDetails | null) {
  if (!details) return false;
  return Boolean(
    details.accountName?.trim() ||
      details.accountNumber?.trim() ||
      details.ifscCode?.trim() ||
      details.bankName?.trim() ||
      details.branch?.trim(),
  );
}

function legacyValue(card: Partial<ICard>, key: ActionButtonKey): string {
  switch (key) {
    case "call":
      return card.phone || "";
    case "whatsapp":
      return card.whatsappNumber || "";
    case "email":
      return card.email || "";
    case "website":
      return card.website || "";
    case "bank":
      return hasBankDetails(card.bankDetails) ? "configured" : "";
    case "address":
      return card.location?.googleMapsUrl || "";
    case "videos":
      return card.extraLinks?.videos || "";
    case "brochures":
      return card.extraLinks?.brochures || "";
    case "bookNow":
      return card.extraLinks?.bookNow || "";
    case "form":
      return card.whatsappNumber || card.phone || "";
    case "facebook":
      return card.socialLinks?.facebook || "";
    case "instagram":
      return card.socialLinks?.instagram || "";
    case "youtube":
      return card.socialLinks?.youtube || "";
    case "linkedin":
      return card.socialLinks?.linkedin || "";
    case "twitter":
      return card.socialLinks?.twitter || "";
    case "review":
      return card.extraLinks?.review || "";
    default:
      return "";
  }
}

export function resolveActionButtons(
  card?: Partial<ICard> | null,
): IActionButton[] {
  const stored = new Map(
    (card?.actionButtons || []).map((b) => [b.key as ActionButtonKey, b]),
  );

  return KEYS.map((key) => {
    const existing = stored.get(key);
    const meta = metaFor(key);
    const fallback = legacyValue(card || {}, key);
    let value = (existing?.value ?? "").trim() || fallback;

    // Modal actions don't need a real URL value
    if (meta.valueKind === "modal") {
      if (key === "bank") {
        value = hasBankDetails(card?.bankDetails) ? "configured" : value;
      }
      if (key === "form") {
        value =
          card?.whatsappNumber?.trim() ||
          card?.phone?.trim() ||
          value ||
          "ready";
      }
    }

    const enabled =
      existing?.enabled ??
      (meta.valueKind === "none" || meta.valueKind === "modal"
        ? key === "bank"
          ? hasBankDetails(card?.bankDetails)
          : key === "form"
            ? Boolean(card?.whatsappNumber || card?.phone)
            : true
        : Boolean(value));

    return { key, enabled, value };
  });
}

export function actionHref(
  key: ActionButtonKey,
  value: string,
): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  switch (key) {
    case "call":
      return `tel:${v}`;
    case "whatsapp":
      return `https://wa.me/${v.replace(/\D/g, "")}`;
    case "email":
      return `mailto:${v}`;
    default:
      return v;
  }
}

export function syncFieldsFromActionButtons(buttons: IActionButton[]) {
  const map = new Map(buttons.map((b) => [b.key, b.value.trim()] as const));
  const get = (k: ActionButtonKey) => map.get(k) || "";

  const socialLinks: ISocialLinks = {
    facebook: get("facebook"),
    instagram: get("instagram"),
    youtube: get("youtube"),
    linkedin: get("linkedin"),
    twitter: get("twitter"),
  };

  const extraLinks: IExtraLinks = {
    videos: get("videos"),
    brochures: get("brochures"),
    bookNow: get("bookNow"),
    review: get("review"),
  };

  return {
    phone: get("call"),
    whatsappNumber: get("whatsapp"),
    email: get("email"),
    website: get("website"),
    googleMapsUrl: get("address"),
    socialLinks,
    extraLinks,
  };
}

/** Migrate older 3-button CTAs to the 4 quick-action layout */
export function normalizePrimaryCtas(
  existing?: IPrimaryCta[] | null,
): IPrimaryCta[] {
  if (!existing?.length) return DEFAULT_PRIMARY_CTAS.map((c) => ({ ...c }));

  const byId = new Map(existing.map((c) => [c.id, c]));
  const legacyLocation = byId.get("location");

  return DEFAULT_PRIMARY_CTAS.map((def) => {
    const found = byId.get(def.id);
    if (found) {
      return {
        ...def,
        label: found.label || def.label,
        url: found.url || "",
        enabled: found.enabled,
      };
    }
    if (def.id === "book" && legacyLocation) {
      return {
        ...def,
        url: legacyLocation.url || "",
        enabled: legacyLocation.enabled,
      };
    }
    return { ...def };
  });
}

export async function downloadUrlAsFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
