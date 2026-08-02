import type { IUserFeatures, IUserLimits } from "./platform.types";

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
  limits?: IUserLimits;
  createdAt: string;
  updatedAt: string;
}
