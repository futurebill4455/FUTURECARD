"use client";

import type { IBusinessHour } from "@/types/card.types";
import { cn } from "@/lib/utils";

function parseMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function getStatus(hours?: IBusinessHour[]) {
  if (!hours?.length) return { open: false, text: "Hours N/A" };
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const today = hours.find((h) => h.day === weekday);
  if (!today || !today.isOpen) return { open: false, text: "Closed today" };
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = parseMinutes(today.openTime);
  const close = parseMinutes(today.closeTime);
  if (mins >= open && mins < close) {
    return { open: true, text: `${today.openTime} – ${today.closeTime}` };
  }
  if (mins < open) return { open: false, text: `Opens ${today.openTime}` };
  return { open: false, text: "Closed now" };
}

export function BusinessHoursBadge({
  hours,
  accent,
  className,
}: {
  hours?: IBusinessHour[];
  accent: string;
  className?: string;
}) {
  const status = getStatus(hours);
  if (!hours?.length) return null;

  return (
    <div
      className={cn(
        "mx-auto flex w-fit max-w-full items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-black/5",
        className,
      )}
      style={{ backgroundColor: "#fff", color: "#1f2937" }}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          status.open ? "animate-pulse" : "",
        )}
        style={{ backgroundColor: status.open ? "#16a34a" : "#dc2626" }}
      />
      <span className="font-bold" style={{ color: accent }}>
        Hours
      </span>
      <span className="text-muted-foreground">·</span>
      <span>{status.text}</span>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
        style={{ backgroundColor: status.open ? "#16a34a" : "#dc2626" }}
      >
        {status.open ? "Open" : "Closed"}
      </span>
    </div>
  );
}
