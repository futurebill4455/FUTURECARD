import {
  getPlatformSettingsRow,
  updatePlatformSettingsRow,
} from "@/lib/db/settings";
import {
  DEFAULT_PLATFORM_SETTINGS,
  type IPlatformSettings,
} from "@/types/platform.types";

/**
 * Platform settings for shells / public cards.
 * Never throws — missing DB/columns fall back to defaults so dashboards stay up.
 */
export async function getPlatformSettings(): Promise<IPlatformSettings> {
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
