import { notFound, redirect } from "next/navigation";
import { renderPublicCardByUsername } from "@/lib/load-public-card";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicCardBySlugPage({ params }: Props) {
  const { slug } = await params;
  const username = slug.toLowerCase();
  if (username !== slug) redirect(`/c/${username}`);
  return renderPublicCardByUsername(username);
}
