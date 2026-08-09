import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireSession } from "@/lib/session";
import {
  formatUnknownError,
  isSupabaseUploadEnabled,
  uploadToSupabaseStorage,
  type StorageUploadError,
} from "@/lib/storage";
import { DatabaseError } from "@/lib/db-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const DEFAULT_MAX_VIDEO_SECONDS = 15;
const ABSOLUTE_MAX_VIDEO_SECONDS = 60;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

type UploadBlob = Blob & { name?: string; type: string; size: number };

function asUploadBlob(value: FormDataEntryValue | null): UploadBlob | null {
  if (!value || typeof value === "string") return null;
  const blob = value as Blob;
  if (typeof blob.arrayBuffer !== "function" || typeof blob.size !== "number") {
    return null;
  }
  return blob as UploadBlob;
}

function inferMime(blob: UploadBlob, kind: string): string {
  const named =
    typeof blob.name === "string" && blob.name.includes(".")
      ? blob.name.split(".").pop()?.toLowerCase()
      : "";
  if (blob.type && blob.type !== "application/octet-stream") return blob.type;
  if (named && EXT_MIME[named]) return EXT_MIME[named];
  return kind === "video" ? "video/mp4" : "image/jpeg";
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      if (!body.url || typeof body.url !== "string") {
        return NextResponse.json({ error: "url required" }, { status: 400 });
      }
      return NextResponse.json({
        data: { url: body.url },
        message: "URL accepted",
      });
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  try {
    const form = await req.formData();
    const file = asUploadBlob(form.get("file"));
    const kind = String(form.get("kind") || "image");
    const durationRaw = form.get("duration");
    const duration =
      durationRaw !== null ? Number(durationRaw) : Number.NaN;
    const maxSecondsRaw = form.get("maxSeconds");
    const maxSeconds = Math.min(
      ABSOLUTE_MAX_VIDEO_SECONDS,
      Math.max(1, Number(maxSecondsRaw) || DEFAULT_MAX_VIDEO_SECONDS),
    );

    if (!file || file.size <= 0) {
      return NextResponse.json(
        {
          error:
            'No file received. Ensure the form field is named "file" and the request is multipart/form-data.',
        },
        { status: 400 },
      );
    }

    const mime = inferMime(file, kind);

    if (kind === "video") {
      if (!VIDEO_TYPES.has(mime)) {
        return NextResponse.json(
          { error: `Video must be MP4, WebM, or MOV (got ${mime || "unknown"})` },
          { status: 400 },
        );
      }
      if (file.size > MAX_VIDEO_BYTES) {
        return NextResponse.json(
          { error: "Video must be 40MB or smaller" },
          { status: 400 },
        );
      }
      if (!Number.isNaN(duration) && duration > maxSeconds + 0.05) {
        return NextResponse.json(
          { error: `Video must be ${maxSeconds}s or shorter` },
          { status: 400 },
        );
      }
    } else {
      if (!IMAGE_TYPES.has(mime) && mime !== "image/jpg") {
        return NextResponse.json(
          {
            error: `Image must be JPEG, PNG, WebP, or GIF (got ${mime || "unknown type"})`,
          },
          { status: 400 },
        );
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Image must be 4MB or smaller" },
          { status: 400 },
        );
      }
    }

    const originalName =
      file.name || `upload.${kind === "video" ? "mp4" : "jpg"}`;
    const ext =
      originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      (kind === "video" ? "mp4" : "jpg");

    const filename = `${kind}-${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const userId = session!.user.id;

    console.info("[upload] received", {
      kind,
      mime,
      size: file.size,
      filename,
      userId,
      supabase: isSupabaseUploadEnabled(),
    });

    let url: string;
    let keySource: string | undefined;

    if (isSupabaseUploadEnabled()) {
      const uploaded = await uploadToSupabaseStorage({
        userId,
        filename,
        bytes,
        contentType: mime,
      });
      url = uploaded.url;
      keySource = uploaded.keySource;
    } else {
      const dir = path.join(process.cwd(), "public", "uploads", userId);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, filename), Buffer.from(bytes));
      url = `/uploads/${userId}/${filename}`;
      keySource = "local";
    }

    return NextResponse.json({
      data: { url, kind, size: file.size, contentType: mime, keySource },
      message: "Uploaded",
    });
  } catch (err) {
    const formatted = formatUnknownError(err);
    const storageErr = err as StorageUploadError;

    console.error("[upload] failed", {
      message: formatted.message,
      statusCode: formatted.statusCode ?? storageErr.statusCode,
      supabaseError: formatted.supabaseError ?? storageErr.supabaseError,
      raw: formatted.raw ?? storageErr.raw ?? err,
    });

    const message =
      err instanceof DatabaseError
        ? err.message
        : formatted.message || "Upload failed";

    const isConfig =
      /not configured|SUPABASE|bucket|Storage|service_role|permission|RLS|ANON_KEY|missing/i.test(
        message,
      );

    return NextResponse.json(
      {
        error: message,
        details: {
          statusCode: formatted.statusCode ?? storageErr.statusCode ?? null,
          supabaseError:
            formatted.supabaseError ?? storageErr.supabaseError ?? null,
          // Helps diagnose without opening Vercel logs
          hint: isConfig
            ? "Check Vercel env vars and Supabase Storage bucket/policies for \"media\"."
            : "See Vercel function logs for [upload] / [storage.upload] entries.",
        },
      },
      { status: isConfig ? 503 : 500 },
    );
  }
}
