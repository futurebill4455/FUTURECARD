/**
 * Flexible Future Shield service taxonomy.
 * Card services map onto these categories by title keywords;
 * unknown titles fall into a freeform "Other" / custom bucket.
 */

export type ServiceCategoryId =
  | "health_insurance"
  | "life_insurance"
  | "vehicle_insurance"
  | "business_insurance"
  | "travel_insurance"
  | "investment"
  | "finance"
  | "real_estate"
  | "travel_tourism"
  | "education"
  | "digital_services"
  | "consulting"
  | "technology"
  | "marketing"
  | "other";

export type ServiceCategory = {
  id: ServiceCategoryId;
  label: string;
  short: string;
  accent: string;
  keywords: string[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "health_insurance",
    label: "Health Insurance",
    short: "Health",
    accent: "#22d3ee",
    keywords: ["health", "medical", "mediclaim", "hospital"],
  },
  {
    id: "life_insurance",
    label: "Life Insurance",
    short: "Life",
    accent: "#a78bfa",
    keywords: ["life", "term", "ulip"],
  },
  {
    id: "vehicle_insurance",
    label: "Vehicle Insurance",
    short: "Vehicle",
    accent: "#38bdf8",
    keywords: ["vehicle", "motor", "car", "bike", "auto"],
  },
  {
    id: "business_insurance",
    label: "Business Insurance",
    short: "Business",
    accent: "#2dd4bf",
    keywords: ["business", "commercial", "liability", "shop"],
  },
  {
    id: "travel_insurance",
    label: "Travel Insurance",
    short: "Travel Ins.",
    accent: "#67e8f9",
    keywords: ["travel insurance", "overseas"],
  },
  {
    id: "investment",
    label: "Investment Planning",
    short: "Invest",
    accent: "#c084fc",
    keywords: ["invest", "mutual", "sip", "portfolio", "wealth"],
  },
  {
    id: "finance",
    label: "Finance",
    short: "Finance",
    accent: "#34d399",
    keywords: ["finance", "loan", "credit", "tax", "gst"],
  },
  {
    id: "real_estate",
    label: "Real Estate",
    short: "Estate",
    accent: "#f472b6",
    keywords: ["real estate", "property", "home", "plot"],
  },
  {
    id: "travel_tourism",
    label: "Travel & Tourism",
    short: "Tourism",
    accent: "#60a5fa",
    keywords: ["tour", "tourism", "holiday", "visa", "trip"],
  },
  {
    id: "education",
    label: "Education",
    short: "Edu",
    accent: "#818cf8",
    keywords: ["education", "school", "course", "training", "coach"],
  },
  {
    id: "digital_services",
    label: "Digital Services",
    short: "Digital",
    accent: "#22d3ee",
    keywords: ["digital", "web", "app", "seo", "software"],
  },
  {
    id: "consulting",
    label: "Business Consulting",
    short: "Consult",
    accent: "#5eead4",
    keywords: ["consult", "advisory", "mentor", "strategy"],
  },
  {
    id: "technology",
    label: "Technology",
    short: "Tech",
    accent: "#38bdf8",
    keywords: ["tech", "ai", "cloud", "saas", "it "],
  },
  {
    id: "marketing",
    label: "Marketing",
    short: "Market",
    accent: "#e879f9",
    keywords: ["market", "brand", "ads", "social media", "campaign"],
  },
  {
    id: "other",
    label: "Specialty Services",
    short: "Other",
    accent: "#94a3b8",
    keywords: [],
  },
];

export function matchServiceCategory(title: string): ServiceCategory {
  const t = title.toLowerCase();
  for (const cat of SERVICE_CATEGORIES) {
    if (cat.id === "other") continue;
    if (cat.keywords.some((k) => t.includes(k))) return cat;
  }
  return SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1];
}

export const PLATFORM_TAGLINE = "Protect today, secure tomorrow.";
export const PLATFORM_BRAND = "Future Shield";
