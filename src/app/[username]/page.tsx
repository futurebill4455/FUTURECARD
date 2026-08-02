import { notFound } from "next/navigation";
import { RESERVED_USERNAMES } from "@/lib/constants";
import { renderPublicCardByUsername } from "@/lib/load-public-card";

type Props = { params: Promise<{ username: string }> };

export default async function PublicCardPage({ params }: Props) {
  const { username } = await params;
  const slug = username.toLowerCase();
  if (RESERVED_USERNAMES.has(slug)) notFound();
  return renderPublicCardByUsername(slug);
}
