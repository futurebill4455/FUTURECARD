import type { IUserFeatures, IUserLimits } from "./platform.types";
import type { ICardSections } from "./card-sections.types";

export type UserRole = "user" | "admin";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
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
