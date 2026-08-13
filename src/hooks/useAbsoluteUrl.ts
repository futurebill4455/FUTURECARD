"use client";

import { useEffect, useState } from "react";
import { absoluteUrl, getPublicOrigin } from "@/lib/utils";

/**
 * Absolute public URL that prefers the live browser origin after mount,
 * so QR codes never point at localhost on Vercel / production.
 */
export function useAbsoluteUrl(path = ""): string {
  const suffix = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";

  const [url, setUrl] = useState(() => absoluteUrl(path));

  useEffect(() => {
    setUrl(`${getPublicOrigin()}${suffix}`);
  }, [suffix]);

  return url;
}

export function useCardPublicUrl(username: string): string {
  return useAbsoluteUrl(`/c/${username}`);
}
