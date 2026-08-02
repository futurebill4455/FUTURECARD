export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type BackgroundMediaType = "none" | "slideshow" | "video";

export interface ISocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  other?: string;
}

export interface ILocation {
  address?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface IBusinessHour {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface IThemeColors {
  /** Page / outer background */
  backgroundColor: string;
  /** Header / cover accent */
  headerColor: string;
  /** Primary CTA + icon accents */
  buttonColor: string;
}

export interface IPrimaryCta {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface IExtraLinks {
  bank?: string;
  videos?: string;
  brochures?: string;
  bookNow?: string;
  form?: string;
  review?: string;
  services?: string;
  payNow?: string;
}

export interface IServiceItem {
  id: string;
  title: string;
  price: string;
  description: string;
  image?: string;
}

/** UPI / Pay Now details shown in the public payment modal */
export interface IPaymentInfo {
  /** Uploaded payment QR code image URL */
  qrCodeImage?: string;
  /** e.g. business@upi */
  upiId?: string;
  /** Mobile number linked to UPI */
  upiMobile?: string;
}

/** Single bank account shown in the Bank action modal */
export interface IBankDetails {
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
}

export const DEFAULT_PAYMENT_INFO: IPaymentInfo = {
  qrCodeImage: "",
  upiId: "",
  upiMobile: "",
};

export const DEFAULT_BANK_DETAILS: IBankDetails = {
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branch: "",
};

export const ACTION_BUTTON_KEYS = [
  "call",
  "whatsapp",
  "email",
  "website",
  "bank",
  "address",
  "videos",
  "brochures",
  "bookNow",
  "form",
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "twitter",
  "review",
  "qr",
  "install",
] as const;

export type ActionButtonKey = (typeof ACTION_BUTTON_KEYS)[number];

export interface IActionButton {
  key: ActionButtonKey;
  enabled: boolean;
  value: string;
}

export const DEFAULT_THEME: IThemeColors = {
  backgroundColor: "#FFF1F2",
  headerColor: "#BE123C",
  buttonColor: "#E11D48",
};

/** Top quick-action bar (4 buttons) */
export const DEFAULT_PRIMARY_CTAS: IPrimaryCta[] = [
  { id: "save", label: "Save Contact", url: "", enabled: true },
  { id: "services", label: "View Service", url: "", enabled: true },
  { id: "book", label: "Book Appointment", url: "", enabled: true },
  { id: "pay", label: "Pay Now (UPI)", url: "", enabled: true },
];

export interface ICard {
  _id: string;
  userId: string;
  username: string;
  profileImage?: string;
  coverImage?: string;
  backgroundMediaType?: BackgroundMediaType;
  backgroundImages?: string[];
  backgroundVideo?: string;
  companyName: string;
  jobTitle: string;
  /** e.g. Wholesale & Retail */
  businessType?: string;
  businessCategory?: string;
  aboutUs?: string;
  gstNumber?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  website?: string;
  socialLinks?: ISocialLinks;
  location?: ILocation;
  businessHours?: IBusinessHour[];
  theme?: IThemeColors;
  primaryCtas?: IPrimaryCta[];
  extraLinks?: IExtraLinks;
  galleryImages?: string[];
  /** Up to 10 services / products */
  services?: IServiceItem[];
  /** Pay Now modal: QR + UPI details */
  paymentInfo?: IPaymentInfo;
  /** Bank account details for Bank action modal */
  bankDetails?: IBankDetails;
  /** Short videos for Video Gallery */
  galleryVideos?: string[];
  /** Per-button visibility + values for the action icon grid */
  actionButtons?: IActionButton[];
  /** Show Instagram-style verified blue tick next to company name */
  isVerified?: boolean;
  /** Hostname mapped to this card (no protocol), e.g. card.mybusiness.com */
  customDomain?: string;
  /** Super Admin approval: none | pending | approved | rejected */
  customDomainStatus?: "none" | "pending" | "approved" | "rejected";
  /** Only Super Admin can set true; mapping works when approved AND active */
  customDomainActive?: boolean;
  customDomainRequestedAt?: string;
  customDomainReviewedAt?: string;
  isActive: boolean;
  template: string;
  createdAt: string;
  updatedAt: string;
}
