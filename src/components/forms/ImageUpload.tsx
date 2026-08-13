"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Kind = "image" | "video";

async function uploadFile(
  file: File,
  kind: Kind,
  duration?: number,
  maxSeconds?: number,
) {
  const body = new FormData();
  // Explicit filename helps some browsers/edge proxies retain File metadata
  body.append("file", file, file.name || `upload.${kind === "video" ? "mp4" : "jpg"}`);
  body.append("kind", kind);
  if (duration !== undefined) body.append("duration", String(duration));
  if (maxSeconds !== undefined) body.append("maxSeconds", String(maxSeconds));

  const res = await fetch("/api/upload", {
    method: "POST",
    body,
    credentials: "include",
  });

  let data: {
    error?: string;
    details?: { statusCode?: string | number | null; supabaseError?: string | null; hint?: string };
    data?: { url?: string };
    message?: string;
  } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(
      res.status === 413
        ? "File too large for the server limit"
        : res.status === 401
          ? "Please sign in again, then retry upload"
          : `Upload failed (HTTP ${res.status})`,
    );
  }

  if (!res.ok) {
    const detail =
      data.details?.supabaseError || data.details?.hint
        ? ` (${[data.details?.supabaseError, data.details?.hint].filter(Boolean).join(" — ")})`
        : "";
    throw new Error((data.error || `Upload failed (HTTP ${res.status})`) + detail);
  }
  if (!data.data?.url) {
    throw new Error("Upload succeeded but no URL returned");
  }
  return data.data.url;
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata"));
    };
    video.src = url;
  });
}

export function MediaUpload({
  label,
  kind = "image",
  value,
  onChange,
  className,
  hint,
  maxSeconds = 15,
}: {
  label: string;
  kind?: Kind;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  hint?: string;
  /** Max allowed video length in seconds (gallery shorts can be longer) */
  maxSeconds?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onPick(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      let duration: number | undefined;
      if (kind === "video") {
        duration = await readVideoDuration(file);
        if (duration > maxSeconds + 0.05) {
          throw new Error(`Video must be ${maxSeconds} seconds or shorter`);
        }
      }
      const url = await uploadFile(file, kind, duration, maxSeconds);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex gap-2">
          {value ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange("")}
            >
              Remove
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </Button>
        </div>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={kind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"}
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
      {value ? (
        <div className="overflow-hidden rounded-xl border bg-muted/40">
          {kind === "video" || value.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
            <video
              src={value}
              className="h-28 w-full object-cover"
              muted
              playsInline
              controls
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-28 w-full object-cover" />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted/40"
        >
          Drop or click to upload
        </button>
      )}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function BackgroundImagesUpload({
  images,
  onChange,
  max = 3,
  title = "Background photos",
  hint = "Upload exactly 3 cinematic photos for a smooth cross-fade slideshow.",
  minHint = 3,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  title?: string;
  hint?: string;
  minHint?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    const remaining = max - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} photos`);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const next = [...images];
      for (const file of Array.from(files).slice(0, remaining)) {
        next.push(await uploadFile(file, "image"));
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading || images.length >= max}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Add photos"}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void onPick(e.target.files)}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {images.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="group relative overflow-hidden rounded-xl border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-24 w-full object-cover" />
            <button
              type="button"
              className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
              onClick={() => onChange(images.filter((_, i) => i !== idx))}
            >
              Remove
            </button>
          </div>
        ))}
        {images.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground"
          >
            Add
          </button>
        ) : null}
      </div>
      {minHint > 0 && images.length > 0 && images.length < minHint ? (
        <p className="text-xs text-amber-700">
          Add at least {minHint - images.length} more photo
          {minHint - images.length > 1 ? "s" : ""}.
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function youtubeThumb(url: string) {
  const m =
    url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
    ) || url.match(/v=([A-Za-z0-9_-]{6,})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

export function VideoGalleryUpload({
  videos,
  onChange,
  max = 12,
}: {
  videos: string[];
  onChange: (videos: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    const remaining = max - videos.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} videos`);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const next = [...videos];
      for (const file of Array.from(files).slice(0, remaining)) {
        const duration = await readVideoDuration(file);
        if (duration > 60.05) {
          throw new Error("Gallery shorts must be 60 seconds or shorter");
        }
        next.push(await uploadFile(file, "video", duration, 60));
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    if (videos.length >= max) {
      setError(`Maximum ${max} videos`);
      return;
    }
    try {
      void new URL(url);
    } catch {
      setError("Enter a valid video URL (https://…)");
      return;
    }
    onChange([...videos, url]);
    setLink("");
    setError("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Video Gallery (Shorts)</p>
          <p className="text-xs text-muted-foreground">
            Upload short clips (max 60s) or paste a direct video / YouTube link.
            Shown with a SHORT badge on the public card.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading || videos.length >= max}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload video"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        onChange={(e) => void onPick(e.target.files)}
      />

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://… video or YouTube link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!link.trim() || videos.length >= max}
          onClick={addLink}
        >
          Add link
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {videos.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="group relative overflow-hidden rounded-xl border bg-black"
          >
            {url.match(/\.(mp4|webm|mov)(\?|$)/i) ||
            url.startsWith("/uploads/") ? (
              <video
                src={url}
                className="aspect-[9/14] h-40 w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : youtubeThumb(url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={youtubeThumb(url)!}
                alt=""
                className="aspect-[9/14] h-40 w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[9/14] h-40 items-center justify-center bg-muted text-xs text-muted-foreground">
                Video link
              </div>
            )}
            <span className="absolute left-2 top-2 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
              Short
            </span>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm shadow">
                ▶
              </span>
            </div>
            <button
              type="button"
              className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
              onClick={() => onChange(videos.filter((_, i) => i !== idx))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {videos.length}/{max} videos
      </p>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

