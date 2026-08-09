import { findBackgroundAnimationBySlug } from "@/lib/db/background-animations";
import {
  isSlideshowAnimation,
  SLIDESHOW_IMAGES_MAX,
  SLIDESHOW_IMAGES_MIN,
  type BackgroundAnimationType,
} from "@/types/background-animation.types";

/**
 * Ensure card background animation slug is an active catalog design.
 * Returns cleaned slug or null when clearing.
 */
export async function assertActiveBackgroundAnimationSlug(
  slug: string | undefined | null,
): Promise<
  | {
      ok: true;
      slug: string | null;
      animationType: BackgroundAnimationType | null;
    }
  | { ok: false; error: string }
> {
  const trimmed = (slug || "").trim();
  if (!trimmed) {
    return { ok: true, slug: null, animationType: null };
  }

  try {
    const design = await findBackgroundAnimationBySlug(trimmed);
    if (!design || !design.isActive) {
      return {
        ok: false,
        error: "Selected background animation is not available",
      };
    }
    return {
      ok: true,
      slug: design.slug,
      animationType: design.animationType,
    };
  } catch {
    // Table may not exist yet — allow empty / pass slug through as soft fail open
    return {
      ok: true,
      slug: trimmed,
      animationType: isSlideshowAnimation(trimmed) ? "slideshow" : "effect",
    };
  }
}

export function normalizeSlideshowImages(
  images?: string[] | null,
): string[] {
  return (images || [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    .slice(0, SLIDESHOW_IMAGES_MAX);
}

/**
 * When the selected animation is a slideshow, require 2–5 images.
 */
export function assertSlideshowImagesForAnimation(opts: {
  animationType: BackgroundAnimationType | null | undefined;
  slug?: string | null;
  images?: string[] | null;
}): { ok: true; images: string[] } | { ok: false; error: string } {
  const isSlideshow =
    opts.animationType === "slideshow" || isSlideshowAnimation(opts.slug);
  const images = normalizeSlideshowImages(opts.images);

  if (!isSlideshow) {
    return { ok: true, images };
  }

  if (images.length < SLIDESHOW_IMAGES_MIN) {
    return {
      ok: false,
      error: `Photo Slideshow requires ${SLIDESHOW_IMAGES_MIN}–${SLIDESHOW_IMAGES_MAX} images`,
    };
  }
  if (images.length > SLIDESHOW_IMAGES_MAX) {
    return {
      ok: false,
      error: `Maximum ${SLIDESHOW_IMAGES_MAX} slideshow images allowed`,
    };
  }
  return { ok: true, images };
}
