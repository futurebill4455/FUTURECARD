import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError, withDbRetry } from "@/lib/db";
import type { IBackgroundAnimation } from "@/types/background-animation.types";

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  animation_type?: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function sb() {
  return getSupabaseAdmin();
}

function mapRow(row: Row): IBackgroundAnimation {
  return {
    _id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || "",
    thumbnailUrl: row.thumbnail_url || "",
    animationType:
      row.animation_type === "slideshow" ? "slideshow" : "effect",
    isActive: row.is_active,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Offline / missing-table catalog so the card editor stays usable */
export const BUILTIN_BACKGROUND_ANIMATIONS: IBackgroundAnimation[] = [
  {
    _id: "builtin-particles",
    slug: "design_a_particles",
    name: "Particles",
    description:
      "Floating luminous particles for a premium futuristic stage.",
    thumbnailUrl: "/bg-previews/particles.svg",
    animationType: "effect",
    isActive: true,
    isDefault: true,
    sortOrder: 10,
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "builtin-waves",
    slug: "design_b_waves",
    name: "Waves",
    description: "Soft animated energy waves behind your profile.",
    thumbnailUrl: "/bg-previews/waves.svg",
    animationType: "effect",
    isActive: true,
    isDefault: false,
    sortOrder: 20,
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "builtin-geometric",
    slug: "design_c_geometric",
    name: "Geometric",
    description: "Rotating geometric accents with clean neon edges.",
    thumbnailUrl: "/bg-previews/geometric.svg",
    animationType: "effect",
    isActive: true,
    isDefault: false,
    sortOrder: 30,
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "builtin-none",
    slug: "design_d_none",
    name: "Minimal",
    description: "No motion — clean dark stage for maximum focus.",
    thumbnailUrl: "/bg-previews/none.svg",
    animationType: "effect",
    isActive: true,
    isDefault: false,
    sortOrder: 40,
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "builtin-slideshow",
    slug: "design_e_slideshow",
    name: "Photo Slideshow",
    description:
      "Full-bleed cross-fade + Ken Burns photo background. Upload 2–5 images on your card.",
    thumbnailUrl: "/bg-previews/slideshow.svg",
    animationType: "slideshow",
    isActive: true,
    isDefault: false,
    sortOrder: 50,
    createdAt: "",
    updatedAt: "",
  },
];

function isMissingTableOrColumn(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string; details?: string };
  const msg = `${e.message || ""} ${e.details || ""}`.toLowerCase();
  return (
    e.code === "42P01" ||
    e.code === "PGRST205" ||
    e.code === "42703" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache")
  );
}

export async function listBackgroundAnimations(opts?: {
  activeOnly?: boolean;
}): Promise<IBackgroundAnimation[]> {
  try {
    let q = sb()
      .from("background_animations")
      .select("*")
      .order("sort_order", { ascending: true });
    if (opts?.activeOnly) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (error) {
      if (isMissingTableOrColumn(error)) {
        console.warn(
          "[db] background_animations missing or incomplete — using built-in catalog. Run supabase/migrations/012_background_animations_rls.sql",
          error,
        );
        const list = BUILTIN_BACKGROUND_ANIMATIONS;
        return opts?.activeOnly ? list.filter((d) => d.isActive) : list;
      }
      throwDbError(error, "listBackgroundAnimations");
    }
    const rows = ((data as Row[]) || []).map(mapRow);
    if (rows.length === 0) {
      console.warn(
        "[db] background_animations is empty — using built-in catalog. Re-run migration 012 seed.",
      );
      const list = BUILTIN_BACKGROUND_ANIMATIONS;
      return opts?.activeOnly ? list.filter((d) => d.isActive) : list;
    }
    return rows;
  } catch (err) {
    if (isMissingTableOrColumn(err)) {
      const list = BUILTIN_BACKGROUND_ANIMATIONS;
      return opts?.activeOnly ? list.filter((d) => d.isActive) : list;
    }
    throw err;
  }
}

export async function findBackgroundAnimationBySlug(
  slug: string,
): Promise<IBackgroundAnimation | null> {
  try {
    const { data, error } = await sb()
      .from("background_animations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      if (isMissingTableOrColumn(error)) {
        return (
          BUILTIN_BACKGROUND_ANIMATIONS.find((d) => d.slug === slug) || null
        );
      }
      throwDbError(error, "findBackgroundAnimationBySlug");
    }
    if (!data) return null;
    return mapRow(data as Row);
  } catch (err) {
    if (isMissingTableOrColumn(err)) {
      return BUILTIN_BACKGROUND_ANIMATIONS.find((d) => d.slug === slug) || null;
    }
    throw err;
  }
}

export async function updateBackgroundAnimation(
  id: string,
  patch: {
    isActive?: boolean;
    isDefault?: boolean;
    name?: string;
    description?: string;
    thumbnailUrl?: string;
    sortOrder?: number;
  },
): Promise<IBackgroundAnimation | null> {
  return withDbRetry(
    async () => {
      // Enforce a single default: clear others first when setting default
      if (patch.isDefault === true) {
        const { error: clearErr } = await sb()
          .from("background_animations")
          .update({ is_default: false, updated_at: new Date().toISOString() })
          .neq("id", id);
        if (clearErr) throwDbError(clearErr, "clearDefaultBackgroundAnimation");
      }

      const row: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (patch.isActive !== undefined) row.is_active = patch.isActive;
      if (patch.isDefault !== undefined) row.is_default = patch.isDefault;
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.description !== undefined) row.description = patch.description;
      if (patch.thumbnailUrl !== undefined) row.thumbnail_url = patch.thumbnailUrl;
      if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;

      // Default design must stay active
      if (patch.isDefault === true) row.is_active = true;

      const { data, error } = await sb()
        .from("background_animations")
        .update(row)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throwDbError(error, "updateBackgroundAnimation");
      if (!data) return null;

      // If we deactivated the default, promote lowest sort_order active design
      if (patch.isActive === false) {
        const current = data as Row;
        if (current.is_default) {
          const { data: next } = await sb()
            .from("background_animations")
            .select("id")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .limit(1)
            .maybeSingle();
          if (next?.id) {
            await updateBackgroundAnimation(next.id, { isDefault: true });
            return findBackgroundAnimationById(id);
          }
        }
      }

      return mapRow(data as Row);
    },
    { context: "updateBackgroundAnimation" },
  );
}

async function findBackgroundAnimationById(
  id: string,
): Promise<IBackgroundAnimation | null> {
  return withDbRetry(
    async () => {
      const { data, error } = await sb()
        .from("background_animations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throwDbError(error, "findBackgroundAnimationById");
      if (!data) return null;
      return mapRow(data as Row);
    },
    { context: "findBackgroundAnimationById" },
  );
}
