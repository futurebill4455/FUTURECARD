import type { ICard } from "@/types/card.types";
import type { IAnalyticsSummary } from "@/types/analytics.types";
import type { IUserFeatures } from "@/types/platform.types";
import type { ICardSections } from "@/types/card-sections.types";

/** Snapshot of https://futurecard-git-main-futurecard1.vercel.app/futureshield */
export const FUTURE_SHIELD_CARD = {
  _id: "ed533d38-d4eb-43c0-ad6b-67c703cd1213",
  userId: "2951ec52-9caf-48c5-96e0-305b907326c5",
  username: "futureshield",
  profileImage:
    "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-8e32bd8a-e5db-4f93-a80e-f62644da2a2d.png",
  coverImage: "",
  backgroundMediaType: "none" as const,
  backgroundImages: [],
  backgroundVideo: "",
  companyName: "FUTURE SHIELD",
  jobTitle: "PROTECT TODAY , SECURE TOMORROW",
  businessType: "Insurance Aggregator",
  businessCategory: "",
  aboutUs:
    "Future Shield is India's trusted insurance aggregator. We help you compare, buy, and manage insurance policies with expert guidance and 24/7 support.",
  gstNumber: "",
  email: "Info@futureshield.in",
  phone: "918714928028",
  whatsappNumber: "918714928028",
  website: "https://www.futureshield.in/",
  socialLinks: {
    twitter: "",
    youtube: "https://www.youtube.com/@futureshieldvideo",
    facebook:
      "https://www.facebook.com/people/Future-Shield/61563348775282/?mibextid=wwXIfr&rdid=U04scKk34BhnXW33&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ZXH1cmJUk%2F%3Fmibextid%3DwwXIfr",
    linkedin: "",
    instagram:
      "https://www.instagram.com/_future_shield?igsh=MWpvMGtoM2ZrYWg0Ng%3D%3D&utm_source=qr",
  },
  location: {
    address:
      "Future Shield Insurance No 8, Annamalai Nagar, Chitode, Opposite Tamilnadu Iti College, Near Vasantham Timbers, Chithode, Erode-638102, Tamil Nadu",
    googleMapsUrl: "",
  },
  businessHours: [
    { day: "Monday" as const, isOpen: true, openTime: "09:30", closeTime: "06:00" },
    { day: "Tuesday" as const, isOpen: true, openTime: "09:30", closeTime: "06:00" },
    { day: "Wednesday" as const, isOpen: true, openTime: "09:30", closeTime: "06:00" },
    { day: "Thursday" as const, isOpen: true, openTime: "09:30", closeTime: "06:00" },
    { day: "Friday" as const, isOpen: true, openTime: "09:30", closeTime: "06:00" },
    { day: "Saturday" as const, isOpen: true, openTime: "09:30", closeTime: "01:00" },
    { day: "Sunday" as const, isOpen: false, openTime: "00:00", closeTime: "00:00" },
  ],
  theme: {
    backgroundColor: "#07131a",
    headerColor: "#042f2e",
    buttonColor: "#2dd4bf",
  },
  primaryCtas: [
    { id: "save", url: "", label: "Save Contact", enabled: true },
    { id: "services", url: "", label: "View Service", enabled: true },
    { id: "book", url: "", label: "Book Appointment", enabled: true },
    { id: "pay", url: "", label: "Pay Now (UPI)", enabled: true },
  ],
  extraLinks: {
    review: "",
    videos: "",
    bookNow: "https://www.futureshield.in/",
    brochures: "",
  },
  galleryImages: [
    "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-f81dd503-7acc-4125-b809-d8f890ea1c84.jpg",
    "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-0d8d4fe8-c1e9-4831-bfa4-f5ba50693d10.jpg",
    "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-01b2b2e2-88bc-431e-9d20-43b0397d5ee3.jpg",
    "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-e0d443e8-e6af-433f-9746-19d74d6896f4.jpg",
    "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-01641b35-d324-4d46-8975-bd4598bfba9d.jpg",
    "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-511a182e-f3e5-4e36-b3cd-ebaee948733f.jpg",
  ],
  services: [
    {
      id: "af84ffb7-355e-459e-bcde-2cc663994e66",
      image:
        "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-9f3a610b-1e16-4be6-9eb0-6269a045fc67.png",
      price: "45",
      title: "HEALTH INSURANCE",
      description: "",
    },
    {
      id: "3157faec-622f-4333-b882-822b35d0ffc0",
      image:
        "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-e32a5558-54b7-4969-83ad-da2ed8abce7c.png",
      price: "999",
      title: "VEHICLE INSURANCE",
      description: "",
    },
    {
      id: "bfc13370-b317-4e2b-9425-67cb5dbce87d",
      image:
        "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-d3f50f22-53ea-4ece-8fcf-ec817d803f21.png",
      price: "1099",
      title: "LIFE INSURANCE",
      description: "",
    },
    {
      id: "a8c744ae-38f4-4a3d-a182-866aef576692",
      image:
        "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-7e8bf547-35a4-411f-9a21-329e152bfa70.png",
      price: "999",
      title: "TRAVEL INSURANCE",
      description: "",
    },
  ],
  paymentInfo: {
    qrCodeImage:
      "https://btommilmsujkxkkwttkv.supabase.co/storage/v1/object/public/media/2951ec52-9caf-48c5-96e0-305b907326c5/image-340fc2ca-0874-4fe4-96d2-75cf08c4deee.jpeg",
    upiId: "",
    upiMobile: "8714928028",
  },
  bankDetails: {
    accountName: "careernav",
    accountNumber: "10230002153161",
    ifscCode: "ESMF0001284",
    bankName: "ESAF",
    branch: "",
  },
  galleryVideos: [],
  actionButtons: [
    { key: "call" as const, value: "918714928028", enabled: true },
    { key: "whatsapp" as const, value: "918714928028", enabled: true },
    { key: "email" as const, value: "Info@futureshield.in", enabled: true },
    { key: "website" as const, value: "https://www.futureshield.in/", enabled: true },
    { key: "bank" as const, value: "configured", enabled: true },
    { key: "address" as const, value: "", enabled: false },
    { key: "videos" as const, value: "", enabled: false },
    { key: "brochures" as const, value: "", enabled: false },
    { key: "bookNow" as const, value: "https://www.futureshield.in/", enabled: true },
    { key: "form" as const, value: "918714928028", enabled: true },
    {
      key: "facebook" as const,
      value:
        "https://www.facebook.com/people/Future-Shield/61563348775282/?mibextid=wwXIfr&rdid=U04scKk34BhnXW33&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ZXH1cmJUk%2F%3Fmibextid%3DwwXIfr",
      enabled: true,
    },
    {
      key: "instagram" as const,
      value:
        "https://www.instagram.com/_future_shield?igsh=MWpvMGtoM2ZrYWg0Ng%3D%3D&utm_source=qr",
      enabled: true,
    },
    {
      key: "youtube" as const,
      value: "https://www.youtube.com/@futureshieldvideo",
      enabled: true,
    },
    { key: "linkedin" as const, value: "", enabled: false },
    { key: "twitter" as const, value: "", enabled: false },
    { key: "review" as const, value: "", enabled: false },
    { key: "qr" as const, value: "", enabled: true },
    { key: "install" as const, value: "", enabled: true },
  ],
  isVerified: true,
  customDomainStatus: "none" as const,
  customDomainActive: false,
  isActive: true,
  template: "classic",
  profileType: "business" as const,
  featuresEnabled: {
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
  },
  backgroundAnimationSlug: "design_a_particles",
  backgroundSlideshowImages: [],
  stats: [
    { id: "years", value: 7, suffix: "+", label: "Years of Experience" },
    { id: "clients", value: 5000, suffix: "+", label: "Happy Clients" },
    { id: "partners", value: 20, suffix: "+", label: "Partner Companies" },
    { id: "support", value: 24, display: "24/7", label: "Support Available" },
  ],
  whyChooseItems: [
    {
      id: "client-first",
      title: "Client First Approach",
      description: "Every recommendation starts with your goals and risk profile.",
      enabled: true,
    },
    {
      id: "transparent",
      title: "Transparent Advice",
      description: "Clear options, honest trade-offs — no pressure tactics.",
      enabled: true,
    },
    {
      id: "best-options",
      title: "Best Options",
      description: "Curated plans across segments so you choose with confidence.",
      enabled: true,
    },
    {
      id: "claims",
      title: "Claim Assistance",
      description: "Hands-on support when you need documentation and follow-ups.",
      enabled: true,
    },
    {
      id: "after-sales",
      title: "After Sales Support",
      description: "Ongoing guidance after purchase — not just at signup.",
      enabled: true,
    },
    {
      id: "relationship",
      title: "Long Term Relationship",
      description: "A lasting partnership for protection, growth, and beyond.",
      enabled: true,
    },
  ],
  createdAt: "2026-08-12T16:39:10.866631+00:00",
  updatedAt: "2026-08-13T02:02:01.621617+00:00",
} satisfies ICard;

export const FUTURE_SHIELD_ANALYTICS: IAnalyticsSummary = {
  totalViews: 26,
  totalClicks: 0,
  totalActions: 5,
  totalShares: 0,
  totalSaveContacts: 0,
  daysLive: 1,
  engagementRate: 20,
};

export const FUTURE_SHIELD_FEATURES: IUserFeatures = {
  services: true,
  payment: true,
  gallery: true,
  inquiryForm: true,
  socialLinks: true,
  bankAndBrochures: true,
  analytics: true,
  customTheme: true,
  verifiedBadge: true,
  customDomain: true,
};

export const FUTURE_SHIELD_SECTIONS: ICardSections = {
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

export const FUTURE_SHIELD_PUBLIC_URL =
  "https://futurecard.online/c/futureshield";
