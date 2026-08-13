"use client";

import { cardPublicUrl } from "@/lib/app-url";
import { absoluteUrl } from "@/lib/utils";

/**
 * Absolute URL for a path. Public card links always use the production
 * domain (NEXT_PUBLIC_APP_URL / futurecard.online), never *.vercel.app.
 */
export function useAbsoluteUrl(path = ""): string {
  return absoluteUrl(path);
}

export function useCardPublicUrl(username: string): string {
  return cardPublicUrl(username);
}
