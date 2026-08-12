/** Default content for Future Shield mini-site sections when the card has no custom copy. */

import {
  DEFAULT_CARD_STATS,
  resolveCardStats,
  type ICardStat,
} from "@/types/card.types";

export type MiniSiteStat = ICardStat;

export type MiniSiteWhyItem = {
  id: string;
  title: string;
  description: string;
};

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

export { resolveCardStats };

export const DEFAULT_WHY_CHOOSE: MiniSiteWhyItem[] = [
  {
    id: "client-first",
    title: "Client First Approach",
    description: "Every recommendation starts with your goals and risk profile.",
  },
  {
    id: "transparent",
    title: "Transparent Advice",
    description: "Clear options, honest trade-offs — no pressure tactics.",
  },
  {
    id: "best-options",
    title: "Best Options",
    description: "Curated plans across segments so you choose with confidence.",
  },
  {
    id: "claims",
    title: "Claim Assistance",
    description: "Hands-on support when you need documentation and follow-ups.",
  },
  {
    id: "after-sales",
    title: "After Sales Support",
    description: "Ongoing guidance after purchase — not just at signup.",
  },
  {
    id: "relationship",
    title: "Long Term Relationship",
    description: "A lasting partnership for protection, growth, and beyond.",
  },
];

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
