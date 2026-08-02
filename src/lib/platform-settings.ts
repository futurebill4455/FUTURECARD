import { dbConnect } from "@/lib/db";
import { PlatformSettings } from "@/models/PlatformSettings";
import {
  DEFAULT_PLATFORM_SETTINGS,
  type IPlatformSettings,
} from "@/types/platform.types";
import { getDefaultCnameTarget } from "@/lib/custom-domain";

function mapDoc(doc: {
  adminWhatsappNumber?: string;
  companyWebsiteUrl?: string;
  companyName?: string;
  footerTagline?: string;
  platformCnameTarget?: string;
  updatedAt?: Date;
}): IPlatformSettings {
  return {
    adminWhatsappNumber:
      doc.adminWhatsappNumber || DEFAULT_PLATFORM_SETTINGS.adminWhatsappNumber,
    companyWebsiteUrl:
      doc.companyWebsiteUrl || DEFAULT_PLATFORM_SETTINGS.companyWebsiteUrl,
    companyName: doc.companyName || DEFAULT_PLATFORM_SETTINGS.companyName,
    footerTagline: doc.footerTagline || DEFAULT_PLATFORM_SETTINGS.footerTagline,
    platformCnameTarget:
      doc.platformCnameTarget ||
      getDefaultCnameTarget() ||
      DEFAULT_PLATFORM_SETTINGS.platformCnameTarget,
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function getPlatformSettings(): Promise<IPlatformSettings> {
  await dbConnect();
  let doc = await PlatformSettings.findOne({ key: "default" });
  if (!doc) {
    doc = await PlatformSettings.create({
      key: "default",
      ...DEFAULT_PLATFORM_SETTINGS,
      platformCnameTarget: getDefaultCnameTarget(),
    });
  }
  return mapDoc(doc);
}

export async function updatePlatformSettings(
  patch: Partial<IPlatformSettings>,
): Promise<IPlatformSettings> {
  await dbConnect();
  const doc = await PlatformSettings.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        ...(patch.adminWhatsappNumber !== undefined
          ? { adminWhatsappNumber: patch.adminWhatsappNumber }
          : {}),
        ...(patch.companyWebsiteUrl !== undefined
          ? { companyWebsiteUrl: patch.companyWebsiteUrl }
          : {}),
        ...(patch.companyName !== undefined
          ? { companyName: patch.companyName }
          : {}),
        ...(patch.footerTagline !== undefined
          ? { footerTagline: patch.footerTagline }
          : {}),
        ...(patch.platformCnameTarget !== undefined
          ? {
              platformCnameTarget: patch.platformCnameTarget
                .trim()
                .toLowerCase()
                .replace(/^https?:\/\//, "")
                .split("/")[0],
            }
          : {}),
      },
      $setOnInsert: { key: "default" },
    },
    { upsert: true, new: true },
  );
  return mapDoc(doc);
}
