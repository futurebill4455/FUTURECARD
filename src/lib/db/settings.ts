import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError, withDbRetry } from "@/lib/db";
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

  if (error) {
    console.error("[settings] getPlatformSettings failed:", error);
    return { ...DEFAULT_PLATFORM_SETTINGS };
  }

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
    if (insertErr) {
      console.error("[settings] createPlatformSettings failed:", insertErr);
      return { ...DEFAULT_PLATFORM_SETTINGS };
    }
    return mapPlatformSettings(created as PlatformSettingsRow);
  }

  try {
    return mapPlatformSettings(data as PlatformSettingsRow);
  } catch (err) {
    console.error("[settings] mapPlatformSettings failed:", err);
    return { ...DEFAULT_PLATFORM_SETTINGS };
  }
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
  if (patch.landingCms !== undefined) {
    row.landing_cms = patch.landingCms;
  }

  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("platform_settings")
        .upsert({ key: "default", ...row }, { onConflict: "key" })
        .select("*")
        .single();
      if (error) {
        // Graceful if migration columns missing
        const msg = String(error.message || "");
        if (msg.includes("ambient_") || msg.includes("landing_cms")) {
          console.warn(
            "[settings] optional columns missing — run ambient + landing CMS migrations",
          );
          const cleaned = { ...row };
          if (msg.includes("landing_cms")) delete cleaned.landing_cms;
          if (msg.includes("ambient_")) {
            delete cleaned.ambient_mode;
            delete cleaned.ambient_video;
            delete cleaned.ambient_images;
          }
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
    },
    { context: "updatePlatformSettings" },
  );
}
