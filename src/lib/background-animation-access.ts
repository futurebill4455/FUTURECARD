import { findBackgroundAnimationBySlug } from "@/lib/db/background-animations";

/**
 * Ensure card background animation slug is an active catalog design.
 * Returns cleaned slug or null when clearing.
 */
export async function assertActiveBackgroundAnimationSlug(
  slug: string | undefined | null,
): Promise<
  | { ok: true; slug: string | null }
  | { ok: false; error: string }
> {
  const trimmed = (slug || "").trim();
  if (!trimmed) return { ok: true, slug: null };

  try {
    const design = await findBackgroundAnimationBySlug(trimmed);
    if (!design || !design.isActive) {
      return {
        ok: false,
        error: "Selected background animation is not available",
      };
    }
    return { ok: true, slug: design.slug };
  } catch {
    // Table may not exist yet — allow empty / pass slug through as soft fail open
    return { ok: true, slug: trimmed };
  }
}
