"use client";

import { useMemo, useState } from "react";
import type { IBusinessHour } from "@/types/card.types";
import { cn } from "@/lib/utils";

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function parseMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function getOpenStatus(hours?: IBusinessHour[]) {
  if (!hours?.length) {
    return { isOpenNow: false, today: null as IBusinessHour | null, label: "Hours unavailable" };
  }

  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const today = hours.find((h) => h.day === weekday) ?? null;
  if (!today) {
    return { isOpenNow: false, today: null, label: "Hours unavailable" };
  }
  if (!today.isOpen) {
    return { isOpenNow: false, today, label: "Closed today" };
  }

  const mins = now.getHours() * 60 + now.getMinutes();
  const open = parseMinutes(today.openTime);
  const close = parseMinutes(today.closeTime);
  const isOpenNow = mins >= open && mins < close;

  return {
    isOpenNow,
    today,
    label: isOpenNow
      ? `Open now · until ${today.closeTime}`
      : mins < open
        ? `Opens at ${today.openTime}`
        : "Closed for today",
  };
}

export function BusinessHours({
  hours,
  className,
}: {
  hours?: IBusinessHour[];
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = useMemo(() => getOpenStatus(hours), [hours]);

  if (!hours?.length) return null;

  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <section className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Business Hours</h2>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition",
            status.isOpenNow
              ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
              : "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-rose-500",
            )}
          />
          {status.isOpenNow ? "Open" : "Closed"}
          <span className="font-medium opacity-70">
            {expanded ? "▴" : "▾"}
          </span>
        </button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{status.label}</p>

      <div
        className={cn(
          "mt-3 overflow-hidden transition-all duration-300",
          expanded ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {hours.map((row) => {
            const isToday = row.day === weekday;
            return (
              <div
                key={row.day}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-center transition",
                  isToday
                    ? "border-teal-600/40 bg-teal-50 shadow-sm"
                    : "bg-muted/40",
                )}
              >
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {DAY_SHORT[row.day] || row.day.slice(0, 3)}
                </div>
                <div
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    row.isOpen ? "text-foreground" : "text-rose-600",
                  )}
                >
                  {row.isOpen ? (
                    <>
                      <div>{row.openTime}</div>
                      <div className="text-[11px] font-medium text-muted-foreground">
                        to {row.closeTime}
                      </div>
                    </>
                  ) : (
                    "Closed"
                  )}
                </div>
                {isToday ? (
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    Today
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {!expanded ? (
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-teal-800 underline-offset-2 hover:underline"
          onClick={() => setExpanded(true)}
        >
          View weekly schedule
        </button>
      ) : (
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => setExpanded(false)}
        >
          Hide schedule
        </button>
      )}
    </section>
  );
}
