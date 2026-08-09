/** Catalog + card selection for mini-site background animations */

export const BACKGROUND_ANIMATION_SLUGS = [
  "design_a_particles",
  "design_b_waves",
  "design_c_geometric",
  "design_d_none",
] as const;

export type BackgroundAnimationSlug =
  (typeof BACKGROUND_ANIMATION_SLUGS)[number];

export interface IBackgroundAnimation {
  _id: string;
  slug: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const FALLBACK_BACKGROUND_ANIMATION_SLUG: BackgroundAnimationSlug =
  "design_a_particles";

export function isKnownAnimationSlug(
  slug?: string | null,
): slug is BackgroundAnimationSlug {
  return Boolean(
    slug &&
      (BACKGROUND_ANIMATION_SLUGS as readonly string[]).includes(slug),
  );
}

/**
 * Resolve which animation to render on the public mini-site.
 * Prefers the card choice when still active; otherwise admin default; else particles.
 */
export function resolveBackgroundAnimationSlug(opts: {
  cardSlug?: string | null;
  catalog: IBackgroundAnimation[];
}): string {
  const active = opts.catalog.filter((d) => d.isActive);
  const pool = active.length ? active : opts.catalog;

  if (opts.cardSlug) {
    const match = pool.find((d) => d.slug === opts.cardSlug);
    if (match) return match.slug;
  }

  const def = pool.find((d) => d.isDefault) || pool[0];
  return def?.slug || FALLBACK_BACKGROUND_ANIMATION_SLUG;
}
