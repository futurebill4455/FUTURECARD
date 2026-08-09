/**
 * Mini-site section feature toggles.
 *
 * Admin grants (`users.card_sections`): master allow-list per account.
 * User prefs (`cards.features_enabled`): per-card switches (only for granted sections).
 * Effective visibility = adminAllow && userPrefer (defaults true when unset).
 */

export const CARD_SECTION_KEYS = [
  "identityCard",
  "about",
  "stats",
  "whyChoose",
  "services",
  "portfolio",
  "reviews",
  "qrTerminal",
  "connect",
  "finalCta",
] as const;

export type CardSectionKey = (typeof CARD_SECTION_KEYS)[number];

export type ICardSections = Record<CardSectionKey, boolean>;

export const DEFAULT_CARD_SECTIONS: ICardSections = {
  identityCard: true,
  about: true,
  stats: true,
  whyChoose: true,
  services: true,
  portfolio: true,
  reviews: true,
  qrTerminal: true,
  connect: true,
  finalCta: true,
};

export const CARD_SECTION_CHECKLIST: {
  key: CardSectionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "identityCard",
    label: "Smart Digital Card",
    description: "3D identity card with QR, Save, Share, Call",
  },
  {
    key: "about",
    label: "About / Profile",
    description: "About text, GST, business hours block",
  },
  {
    key: "stats",
    label: "Stats Counters",
    description: "Experience / clients / partners metrics",
  },
  {
    key: "whyChoose",
    label: "Why Choose Me",
    description: "Trust pillars grid",
  },
  {
    key: "services",
    label: "Services / Products",
    description: "Service catalog section (also needs Products feature)",
  },
  {
    key: "portfolio",
    label: "Portfolio",
    description: "Image & video gallery (also needs Gallery feature)",
  },
  {
    key: "reviews",
    label: "Reviews / Testimonials",
    description: "Client voice carousel",
  },
  {
    key: "qrTerminal",
    label: "QR Connect Terminal",
    description: "Scan-to-connect holographic block",
  },
  {
    key: "connect",
    label: "Connect With Me",
    description: "Action icon hub",
  },
  {
    key: "finalCta",
    label: "Final CTA",
    description: "Let's build your secure tomorrow band",
  },
];

/** Normalize admin grants (users.card_sections) */
export function resolveCardSections(
  raw?: Partial<ICardSections> | null,
): ICardSections {
  const r = raw || {};
  const out = { ...DEFAULT_CARD_SECTIONS };
  for (const key of CARD_SECTION_KEYS) {
    if (typeof r[key] === "boolean") out[key] = r[key]!;
  }
  return out;
}

/**
 * Normalize per-card user prefs (cards.features_enabled).
 * Missing keys default to true (show when admin allows).
 */
export function resolveCardFeaturesEnabled(
  raw?: Partial<ICardSections> | null,
): ICardSections {
  return resolveCardSections(raw);
}

/** Effective public visibility for one section */
export function isSectionVisible(
  key: CardSectionKey,
  adminSections?: Partial<ICardSections> | null,
  cardEnabled?: Partial<ICardSections> | null,
): boolean {
  const admin = resolveCardSections(adminSections);
  const user = resolveCardFeaturesEnabled(cardEnabled);
  return Boolean(admin[key] && user[key]);
}

export function resolveEffectiveSections(
  adminSections?: Partial<ICardSections> | null,
  cardEnabled?: Partial<ICardSections> | null,
): ICardSections {
  const admin = resolveCardSections(adminSections);
  const user = resolveCardFeaturesEnabled(cardEnabled);
  const out = { ...DEFAULT_CARD_SECTIONS };
  for (const key of CARD_SECTION_KEYS) {
    out[key] = Boolean(admin[key] && user[key]);
  }
  return out;
}

/**
 * Merge incoming per-card prefs while preserving values for sections
 * the Super Admin has disabled (user cannot turn those on via API).
 */
export function mergeFeaturesEnabledRespectingAdmin(
  adminSections: Partial<ICardSections> | null | undefined,
  previous: Partial<ICardSections> | null | undefined,
  incoming: Partial<ICardSections> | null | undefined,
): ICardSections {
  const admin = resolveCardSections(adminSections);
  const prev = resolveCardFeaturesEnabled(previous);
  const next = resolveCardFeaturesEnabled({ ...prev, ...(incoming || {}) });
  for (const key of CARD_SECTION_KEYS) {
    if (!admin[key] && next[key]) {
      next[key] = prev[key];
    }
  }
  return next;
}
