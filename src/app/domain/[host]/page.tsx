import { renderPublicCardByCustomDomain } from "@/lib/load-public-card";
import { normalizeHostname } from "@/lib/custom-domain";

type Props = { params: Promise<{ host: string }> };

export default async function CustomDomainCardPage({ params }: Props) {
  const { host: raw } = await params;
  const host = normalizeHostname(decodeURIComponent(raw));
  return renderPublicCardByCustomDomain(host);
}
