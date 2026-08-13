import { unstable_noStore as noStore, revalidatePath, revalidateTag } from "next/cache";
import {
  getPlatformSettingsRow,
  updatePlatformSettingsRow,
} from "@/lib/db/settings";
import {
  DEFAULT_PLATFORM_SETTINGS,
  type IPlatformSettings,
} from "@/types/platform.types";

export const LANDING_CMS_CACHE_TAG = "landing-cms";

export function revalidateLandingPages() {
  revalidateTag(LANDING_CMS_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/domain/[host]");
}

/**
 * Platform settings for shells / public cards.
 * Never throws — missing DB/columns fall back to defaults so dashboards stay up.
 */
export async function getPlatformSettings(): Promise<IPlatformSettings> {
  noStore();
  try {
    return await getPlatformSettingsRow();
  } catch (err) {
    console.error("[platform-settings] read failed, using defaults:", err);
    return { ...DEFAULT_PLATFORM_SETTINGS };
  }
}

export async function updatePlatformSettings(
  patch: Partial<IPlatformSettings>,
): Promise<IPlatformSettings> {
  return updatePlatformSettingsRow(patch);
}
