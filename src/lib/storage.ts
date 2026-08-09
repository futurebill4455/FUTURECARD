import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

export const MEDIA_BUCKET = "media";

export type StorageUploadError = Error & {
  statusCode?: string | number;
  supabaseError?: string;
  raw?: unknown;
};

function resolveSupabaseKeys() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;
  const keySource = serviceKey ? "service_role" : anonKey ? "anon" : null;

  return { url, key, keySource };
}

/**
 * Prefer SUPABASE_SERVICE_ROLE_KEY; safely fall back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
function getStorageClient(): { client: SupabaseClient; keySource: string } {
  const { url, key, keySource } = resolveSupabaseKeys();

  if (!url) {
    throw makeStorageError(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Set it in Vercel Environment Variables and redeploy.",
    );
  }

  if (!key || !keySource) {
    throw makeStorageError(
      "Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set. Add at least one in Vercel env.",
    );
  }

  if (keySource === "anon") {
    console.warn(
      "[storage] SUPABASE_SERVICE_ROLE_KEY missing — falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY. Ensure Storage RLS allows INSERT on bucket \"media\".",
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { "X-Client-Info": `futurecard-upload/${keySource}` },
    },
  });

  return { client, keySource };
}

function makeStorageError(
  message: string,
  extras?: { statusCode?: string | number; supabaseError?: string; raw?: unknown },
): StorageUploadError {
  const err = new Error(message) as StorageUploadError;
  err.name = "StorageUploadError";
  if (extras?.statusCode !== undefined) err.statusCode = extras.statusCode;
  if (extras?.supabaseError) err.supabaseError = extras.supabaseError;
  if (extras?.raw !== undefined) err.raw = extras.raw;
  return err;
}

/** Serialize any Supabase / unknown error into a readable message + metadata */
export function formatUnknownError(err: unknown): {
  message: string;
  statusCode?: string | number;
  supabaseError?: string;
  raw: unknown;
} {
  if (!err) {
    return { message: "Unknown upload error", raw: null };
  }

  if (typeof err === "string") {
    return { message: err, raw: err };
  }

  if (err instanceof Error) {
    const e = err as StorageUploadError;
    return {
      message: e.message || "Upload failed",
      statusCode: e.statusCode,
      supabaseError: e.supabaseError,
      raw: {
        name: e.name,
        message: e.message,
        statusCode: e.statusCode,
        supabaseError: e.supabaseError,
        stack: e.stack,
      },
    };
  }

  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    const message = String(
      o.message || o.error || o.msg || JSON.stringify(o),
    );
    return {
      message,
      statusCode: (o.statusCode ?? o.status) as string | number | undefined,
      supabaseError: o.error ? String(o.error) : undefined,
      raw: o,
    };
  }

  return { message: String(err), raw: err };
}

/**
 * Upload media to Supabase Storage and return a public URL.
 * Uses a pure ArrayBuffer (not Node Buffer) for App Router / Vercel compatibility.
 */
export async function uploadToSupabaseStorage(input: {
  userId: string;
  filename: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<{ url: string; path: string; keySource: string }> {
  const { client, keySource } = getStorageClient();
  const objectPath = `${sanitizePathSegment(input.userId)}/${sanitizePathSegment(input.filename)}`;
  const contentType = input.contentType || "application/octet-stream";

  // Standalone ArrayBuffer body — reliable for storage-js in Next.js App Router
  const arrayBuffer = input.bytes.buffer.slice(
    input.bytes.byteOffset,
    input.bytes.byteOffset + input.bytes.byteLength,
  ) as ArrayBuffer;

  console.info("[storage.upload] start", {
    bucket: MEDIA_BUCKET,
    path: objectPath,
    contentType,
    size: input.bytes.byteLength,
    keySource,
  });

  let result: Awaited<
    ReturnType<ReturnType<SupabaseClient["storage"]["from"]>["upload"]>
  >;

  try {
    result = await client.storage.from(MEDIA_BUCKET).upload(objectPath, arrayBuffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });
  } catch (thrown) {
    const formatted = formatUnknownError(thrown);
    console.error("[storage.upload] threw", formatted);
    throw makeStorageError(
      `Storage upload threw: ${formatted.message}`,
      {
        statusCode: formatted.statusCode,
        supabaseError: formatted.supabaseError,
        raw: formatted.raw,
      },
    );
  }

  const { data, error } = result;

  if (error) {
    const formatted = formatUnknownError(error);
    console.error("[storage.upload] supabase error", {
      bucket: MEDIA_BUCKET,
      path: objectPath,
      contentType,
      size: input.bytes.byteLength,
      keySource,
      ...formatted,
      full: error,
    });

    const msg = formatted.message || "Storage upload failed";

    if (/bucket/i.test(msg) && /not found|exist/i.test(msg)) {
      throw makeStorageError(
        `Supabase Storage bucket "${MEDIA_BUCKET}" not found. Create a public bucket named "media", or run supabase/migrations/003_storage_media.sql. Details: ${msg}`,
        { statusCode: formatted.statusCode, supabaseError: formatted.supabaseError, raw: error },
      );
    }
    if (/row-level security|RLS|policy|unauthorized|permission|jwt|invalid/i.test(msg)) {
      throw makeStorageError(
        `Storage permission denied (${msg}). Using key source: ${keySource}. ${
          keySource === "anon"
            ? "Add SUPABASE_SERVICE_ROLE_KEY or ensure INSERT policy on bucket \"media\" allows anon/public."
            : "Check Storage policies for bucket \"media\"."
        }`,
        { statusCode: formatted.statusCode, supabaseError: formatted.supabaseError, raw: error },
      );
    }

    throw makeStorageError(msg, {
      statusCode: formatted.statusCode,
      supabaseError: formatted.supabaseError,
      raw: error,
    });
  }

  const publicUrl = client.storage.from(MEDIA_BUCKET).getPublicUrl(
    data?.path || objectPath,
  ).data.publicUrl;

  if (!publicUrl) {
    throw makeStorageError("Upload completed but public URL could not be resolved", {
      raw: data,
    });
  }

  console.info("[storage.upload] ok", { path: objectPath, publicUrl, keySource });

  return { url: publicUrl, path: objectPath, keySource };
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function isSupabaseUploadEnabled() {
  if (process.env.UPLOAD_DRIVER === "local") return false;
  if (process.env.UPLOAD_DRIVER === "supabase") return true;
  if (process.env.VERCEL) return true;
  const { url, key } = resolveSupabaseKeys();
  return Boolean(url && key);
}

export function assertSupabaseConfigured() {
  getSupabaseAdmin();
}

/**
 * Best-effort purge of a user's media folder in Supabase Storage
 * (`media/{userId}/…`) and optional local `public/uploads/{userId}`.
 */
export async function removeUserMedia(userId: string): Promise<{
  storageRemoved: number;
  localRemoved: boolean;
}> {
  const folder = sanitizePathSegment(userId);
  let storageRemoved = 0;

  try {
    const { client } = getStorageClient();
    const paths = await listAllObjectPaths(client, folder);
    if (paths.length) {
      // remove() accepts up to ~1000 paths; chunk for safety
      for (let i = 0; i < paths.length; i += 100) {
        const chunk = paths.slice(i, i + 100);
        const { error } = await client.storage.from(MEDIA_BUCKET).remove(chunk);
        if (error) {
          console.warn("[storage.removeUserMedia] remove error", {
            folder,
            error,
          });
        } else {
          storageRemoved += chunk.length;
        }
      }
    }
  } catch (err) {
    console.warn("[storage.removeUserMedia] skipped storage cleanup", err);
  }

  let localRemoved = false;
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.rm(dir, { recursive: true, force: true });
    localRemoved = true;
  } catch (err) {
    console.warn("[storage.removeUserMedia] local cleanup skipped", err);
  }

  return { storageRemoved, localRemoved };
}

async function listAllObjectPaths(
  client: SupabaseClient,
  folder: string,
): Promise<string[]> {
  const paths: string[] = [];
  const queue = [folder];

  while (queue.length) {
    const prefix = queue.shift()!;
    const { data, error } = await client.storage.from(MEDIA_BUCKET).list(prefix, {
      limit: 1000,
    });
    if (error) {
      console.warn("[storage.listAllObjectPaths]", { prefix, error });
      continue;
    }
    for (const item of data ?? []) {
      const full = `${prefix}/${item.name}`;
      // Supabase folders have null id / no metadata
      if (item.id == null && !item.metadata) {
        queue.push(full);
      } else {
        paths.push(full);
      }
    }
  }

  return paths;
}
