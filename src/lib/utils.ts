import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { absoluteAppUrl, getAppOrigin } from "@/lib/app-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** @deprecated Prefer getAppOrigin — kept so existing imports keep working. */
export function getPublicOrigin(): string {
  return getAppOrigin();
}

export function absoluteUrl(path = "") {
  return absoluteAppUrl(path);
}
