import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError } from "@/lib/db";
import {
  mapPlatformSettings,
  type PlatformSettingsRow,
} from "@/lib/db/mappers";
import {
  DEFAULT_PLATFORM_SETTINGS,
  type IPlatformSettings,
} from "@/types/platform.types";
import { getDefaultCnameTarget } from "@/lib/custom-domain";

function sb() {
  return getSupabaseAdmin();
}

export async function getPlatformSettingsRow(): Promise<IPlatformSettings> {
  const { data, error } = await sb()
    .from("platform_settings")
    .select("*")
    .eq("key", "default")
    .maybeSingle();

  if (error) throwDbError(error, "getPlatformSettings");

  if (!data) {
    const { data: created, error: insertErr } = await sb()
      .from("platform_settings")
      .insert({
        key: "default",
        admin_whatsapp_number: DEFAULT_PLATFORM_SETTINGS.adminWhatsappNumber,
        company_website_url: DEFAULT_PLATFORM_SETTINGS.companyWebsiteUrl,
        company_name: DEFAULT_PLATFORM_SETTINGS.companyName,
        footer_tagline: DEFAULT_PLATFORM_SETTINGS.footerTagline,
        platform_cname_target:
          getDefaultCnameTarget() ||
          DEFAULT_PLATFORM_SETTINGS.platformCnameTarget,
      })
      .select("*")
      .single();
    if (insertErr) throwDbError(insertErr, "createPlatformSettings");
    return mapPlatformSettings(created as PlatformSettingsRow);
  }

  return mapPlatformSettings(data as PlatformSettingsRow);
}

export async function updatePlatformSettingsRow(
  patch: Partial<IPlatformSettings>,
): Promise<IPlatformSettings> {
  const row: Record<string, unknown> = {};
  if (patch.adminWhatsappNumber !== undefined) {
    row.admin_whatsapp_number = patch.adminWhatsappNumber;
  }
  if (patch.companyWebsiteUrl !== undefined) {
    row.company_website_url = patch.companyWebsiteUrl;
  }
  if (patch.companyName !== undefined) {
    row.company_name = patch.companyName;
  }
  if (patch.footerTagline !== undefined) {
    row.footer_tagline = patch.footerTagline;
  }
  if (patch.platformCnameTarget !== undefined) {
    row.platform_cname_target = patch.platformCnameTarget
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0];
  }
  if (patch.ambientMode !== undefined) {
    row.ambient_mode = patch.ambientMode;
  }
  if (patch.ambientVideo !== undefined) {
    row.ambient_video = patch.ambientVideo;
  }
  if (patch.ambientImages !== undefined) {
    row.ambient_images = patch.ambientImages.slice(0, 3);
  }

  const { data, error } = await sb()
    .from("platform_settings")
    .upsert({ key: "default", ...row }, { onConflict: "key" })
    .select("*")
    .single();
  if (error) {
    // Graceful if migration 002 not applied yet
    if (String(error.message || "").includes("ambient_")) {
      console.warn(
        "[settings] ambient_* columns missing — run supabase/migrations/002_ambient_background.sql",
      );
      const cleaned = { ...row };
      delete cleaned.ambient_mode;
      delete cleaned.ambient_video;
      delete cleaned.ambient_images;
      const retry = await sb()
        .from("platform_settings")
        .upsert({ key: "default", ...cleaned }, { onConflict: "key" })
        .select("*")
        .single();
      if (retry.error) throwDbError(retry.error, "updatePlatformSettings");
      return mapPlatformSettings(retry.data as PlatformSettingsRow);
    }
    throwDbError(error, "updatePlatformSettings");
  }
  return mapPlatformSettings(data as PlatformSettingsRow);
}
