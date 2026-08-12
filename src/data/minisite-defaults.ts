/** Default content for Future Shield mini-site sections when the card has no custom copy. */

import {
  DEFAULT_CARD_STATS,
  DEFAULT_WHY_CHOOSE_ITEMS,
  resolveCardStats,
  resolveWhyChooseItems,
  type ICardStat,
  type IWhyChooseItem,
} from "@/types/card.types";

export type MiniSiteStat = ICardStat;

export type MiniSiteWhyItem = IWhyChooseItem;

export type MiniSiteTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
};

export const DEFAULT_MINISITE_STATS: MiniSiteStat[] = DEFAULT_CARD_STATS.map(
  (s) => ({ ...s }),
);

export const DEFAULT_WHY_CHOOSE: MiniSiteWhyItem[] = DEFAULT_WHY_CHOOSE_ITEMS.map(
  (item) => ({ ...item }),
);

export { resolveCardStats, resolveWhyChooseItems };

export const DEFAULT_TESTIMONIALS: MiniSiteTestimonial[] = [
  {
    id: "t1",
    name: "Ananya R.",
    role: "Business Owner",
    quote:
      "Clear advice and a futuristic digital profile that made sharing my details effortless.",
    rating: 5,
    initials: "AR",
  },
  {
    id: "t2",
    name: "Rahul K.",
    role: "IT Professional",
    quote:
      "Felt premium from the first tap — contact save, WhatsApp, and services in one place.",
    rating: 5,
    initials: "RK",
  },
  {
    id: "t3",
    name: "Meera S.",
    role: "Founder",
    quote:
      "Trustworthy guidance with a digital identity that finally looks like 2026.",
    rating: 5,
    initials: "MS",
  },
];
