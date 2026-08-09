import { getSupabaseAdmin } from "@/lib/supabase";
import { throwDbError } from "@/lib/db";
import type { IBackgroundAnimation } from "@/types/background-animation.types";

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
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
    isActive: row.is_active,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listBackgroundAnimations(opts?: {
  activeOnly?: boolean;
}): Promise<IBackgroundAnimation[]> {
  let q = sb()
    .from("background_animations")
    .select("*")
    .order("sort_order", { ascending: true });
  if (opts?.activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throwDbError(error, "listBackgroundAnimations");
  return ((data as Row[]) || []).map(mapRow);
}

export async function findBackgroundAnimationBySlug(
  slug: string,
): Promise<IBackgroundAnimation | null> {
  const { data, error } = await sb()
    .from("background_animations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throwDbError(error, "findBackgroundAnimationBySlug");
  if (!data) return null;
  return mapRow(data as Row);
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
}

async function findBackgroundAnimationById(
  id: string,
): Promise<IBackgroundAnimation | null> {
  const { data, error } = await sb()
    .from("background_animations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDbError(error, "findBackgroundAnimationById");
  if (!data) return null;
  return mapRow(data as Row);
}
