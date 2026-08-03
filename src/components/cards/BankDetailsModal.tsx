"use client";

import { useEffect, useState } from "react";
import type { IBankDetails, ICard } from "@/types/card.types";
import { hasBankDetails } from "@/lib/action-buttons";

function CopyRow({
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
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
    }
  }

  return (
    <div className="rounded-xl bg-muted/40 p-3 ring-1 ring-black/5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="min-w-0 flex-1 break-all font-semibold">{value}</div>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-extrabold text-white"
          style={{ backgroundColor: accent }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function BankDetailsModal({
  card,
  accent,
  onClose,
}: {
  card: ICard;
  accent: string;
  onClose: () => void;
}) {
  const d = card.bankDetails;
  if (!hasBankDetails(d)) return null;

  const rows: { label: string; value?: string }[] = [
    { label: "Account name", value: d?.accountName },
    { label: "Account number", value: d?.accountNumber },
    { label: "IFSC code", value: d?.ifscCode },
    { label: "Bank name", value: d?.bankName },
    { label: "Branch", value: d?.branch },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 text-white" style={{ backgroundColor: accent }}>
          <h3 className="font-display text-xl font-extrabold">Bank Details</h3>
          <p className="text-sm opacity-90">{card.companyName}</p>
        </div>
        <div className="space-y-2.5 p-5">
          {rows.map((r) =>
            r.value?.trim() ? (
              <CopyRow
                key={r.label}
                label={r.label}
                value={r.value.trim()}
                accent={accent}
              />
            ) : null,
          )}
          <button
            type="button"
            className="mt-2 w-full rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function BankDetailsForm({
  value,
  onChange,
}: {
  value: IBankDetails;
  onChange: (next: IBankDetails) => void;
}) {
  const fields: { key: keyof IBankDetails; label: string; placeholder: string }[] =
    [
      { key: "accountName", label: "Account name", placeholder: "Future Shield" },
      { key: "accountNumber", label: "Account number", placeholder: "1234567890" },
      { key: "ifscCode", label: "IFSC code", placeholder: "SBIN0001234" },
      { key: "bankName", label: "Bank name", placeholder: "State Bank of India" },
      { key: "branch", label: "Branch", placeholder: "MG Road, Bengaluru" },
    ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        One bank account for the public <strong>Bank</strong> button. Visitors
        can copy each field.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="space-y-1.5 text-sm">
            <span className="font-medium">{f.label}</span>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder={f.placeholder}
              value={value[f.key] || ""}
              onChange={(e) =>
                onChange({ ...value, [f.key]: e.target.value })
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}
