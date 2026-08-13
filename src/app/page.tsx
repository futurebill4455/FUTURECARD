import { renderHomeExperience } from "@/lib/home-experience";

export const dynamic = "force-dynamic";

/**
 * Platform root (`/`) — always renders a landing page or redirects.
 * Guarantees the home route exists on Vercel (no 404).
 */
export default async function HomePage() {
  return renderHomeExperience();
}
