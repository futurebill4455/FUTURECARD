import { normalizeHostname } from "@/lib/custom-domain";
import { renderPublicCardByCustomDomain } from "@/lib/load-public-card";
import { dbConnect } from "@/lib/db";
import { findCardByCustomDomain } from "@/lib/db/cards";
import { renderHomeExperience } from "@/lib/home-experience";

type Props = { params: Promise<{ host: string }> };

/**
 * Tenant custom-domain entry.
 * If no card is mapped to this host (common when the platform apex like
 * futurecard.online was not listed in PLATFORM_HOSTS), show the normal
 * home/landing experience instead of a hard Next.js 404.
 */
export default async function CustomDomainCardPage({ params }: Props) {
  const { host: raw } = await params;
  const host = normalizeHostname(decodeURIComponent(raw));

  try {
    await dbConnect();
    const card = await findCardByCustomDomain(host);
    if (!card) {
      return renderHomeExperience();
    }
  } catch (err) {
    console.error("[domain] lookup failed, falling back to home:", err);
    return renderHomeExperience();
  }

  return renderPublicCardByCustomDomain(host);
}
