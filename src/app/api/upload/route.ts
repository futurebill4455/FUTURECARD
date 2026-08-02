import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireSession } from "@/lib/session";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40MB (gallery shorts)
const DEFAULT_MAX_VIDEO_SECONDS = 15;
const ABSOLUTE_MAX_VIDEO_SECONDS = 60;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const contentType = req.headers.get("content-type") || "";

  // Allow URL-only registration (external CDN / Unsplash)
  if (contentType.includes("application/json")) {
    const body = await req.json();
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }
    return NextResponse.json({
      data: { url: body.url },
      message: "URL accepted",
    });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "image");
    const durationRaw = form.get("duration");
    const duration =
      durationRaw !== null ? Number(durationRaw) : Number.NaN;
    const maxSecondsRaw = form.get("maxSeconds");
    const maxSeconds = Math.min(
      ABSOLUTE_MAX_VIDEO_SECONDS,
      Math.max(
        1,
        Number(maxSecondsRaw) || DEFAULT_MAX_VIDEO_SECONDS,
      ),
    );

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    if (kind === "video") {
      if (!VIDEO_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Video must be MP4, WebM, or MOV" },
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
      if (!IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Image must be JPEG, PNG, WebP, or GIF" },
          { status: 400 },
        );
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Image must be 5MB or smaller" },
          { status: 400 },
        );
      }
    }

    const ext =
      file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      (kind === "video" ? "mp4" : "jpg");

    const dir = path.join(
      process.cwd(),
      "public",
      "uploads",
      session!.user.id,
    );
    await mkdir(dir, { recursive: true });

    const filename = `${kind}-${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const url = `/uploads/${session!.user.id}/${filename}`;
    return NextResponse.json({
      data: { url, kind, size: file.size },
      message: "Uploaded",
    });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
