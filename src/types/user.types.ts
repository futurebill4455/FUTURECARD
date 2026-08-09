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
  limits?: IUserLimits;
  createdAt: string;
  updatedAt: string;
}
