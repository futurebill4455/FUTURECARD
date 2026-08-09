import {
  getPlatformSettingsRow,
  updatePlatformSettingsRow,
} from "@/lib/db/settings";
import type { IPlatformSettings } from "@/types/platform.types";

export async function getPlatformSettings(): Promise<IPlatformSettings> {
  return getPlatformSettingsRow();
}

export async function updatePlatformSettings(
  patch: Partial<IPlatformSettings>,
): Promise<IPlatformSettings> {
  return updatePlatformSettingsRow(patch);
}
