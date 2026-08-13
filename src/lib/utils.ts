import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  absoluteAppUrl,
  getCanonicalPublicOrigin,
} from "@/lib/app-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Production origin used for shared / generated card links. */
export function getPublicOrigin(): string {
  return getCanonicalPublicOrigin();
}

export function absoluteUrl(path = "") {
  return absoluteAppUrl(path);
}
