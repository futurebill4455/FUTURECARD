"use client";

import { useEffect, useState } from "react";
import type { ICard, IPaymentInfo } from "@/types/card.types";
import { cn } from "@/lib/utils";

export function hasPaymentDetails(info?: IPaymentInfo | null) {
  if (!info) return false;
  return Boolean(
    info.qrCodeImage?.trim() ||
      info.upiId?.trim() ||
      info.upiMobile?.trim(),
  );
}

function CopyField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Fallback for older browsers / insecure contexts
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(el);
      }
    }
  }

  return (
    <div className="rounded-xl bg-muted/50 p-3 ring-1 ring-black/5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="min-w-0 flex-1 truncate font-semibold tracking-tight">
          {value}
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-extrabold text-white transition active:scale-[0.98]",
          )}
          style={{ backgroundColor: accent }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function PayNowModal({
  card,
  accent,
  onClose,
}: {
  card: ICard;
  accent: string;
  onClose: () => void;
}) {
  const info = card.paymentInfo;
  const qr = info?.qrCodeImage?.trim();
  const upiId = info?.upiId?.trim();
  const upiMobile = info?.upiMobile?.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pay Now"
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 text-white"
          style={{ backgroundColor: accent }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Secure payment
              </p>
              <h3 className="font-display text-xl font-extrabold">Pay Now</h3>
              <p className="mt-0.5 text-sm opacity-90">{card.companyName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/20 px-2.5 py-1 text-sm font-bold leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {qr ? (
            <div className="mx-auto max-w-[240px]">
              <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr}
                  alt="Payment QR code"
                  className="aspect-square w-full object-contain"
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Scan with any UPI app to pay
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/30 py-10 text-center text-sm text-muted-foreground">
              No payment QR uploaded yet
            </div>
          )}

          <div className="space-y-2.5">
            {upiId ? (
              <CopyField label="UPI ID" value={upiId} accent={accent} />
            ) : null}
            {upiMobile ? (
              <CopyField
                label="UPI mobile number"
                value={upiMobile}
                accent={accent}
              />
            ) : null}
            {!upiId && !upiMobile ? (
              <p className="text-center text-sm text-muted-foreground">
                UPI details are not configured for this card.
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className="w-full rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
