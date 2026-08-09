/** Default content for Future Shield mini-site sections when the card has no custom copy. */

export type MiniSiteStat = {
  id: string;
  value: number;
  suffix?: string;
  label: string;
  /** Display verbatim when number animation isn't suitable (e.g. "24/7") */
  display?: string;
};

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

export const DEFAULT_MINISITE_STATS: MiniSiteStat[] = [
  { id: "years", value: 5, suffix: "+", label: "Years Experience" },
  { id: "clients", value: 500, suffix: "+", label: "Happy Clients" },
  { id: "partners", value: 20, suffix: "+", label: "Partner Companies" },
  { id: "support", value: 24, display: "24/7", label: "Support Available" },
];

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
