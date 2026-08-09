import type { IUserFeatures, IUserLimits } from "./platform.types";
import type { ICardSections } from "./card-sections.types";

export type UserRole = "user" | "admin";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  /** Mobile collected at signup (required for new self-registrations) */
  phone?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  /**
   * Self-signup accounts start false until Super Admin approves.
   * Admins and admin-created users are approved by default.
   */
  isApproved: boolean;
  features?: IUserFeatures;
  /** Super Admin grants for public mini-site sections */
  cardSections?: ICardSections;
  /**
   * Max digital cards this account may create.
   * Synced with `limits.maxCards`; column is the create-gate source of truth.
   */
  maxCardsLimit?: number;
  limits?: IUserLimits;
  createdAt: string;
  updatedAt: string;
}
