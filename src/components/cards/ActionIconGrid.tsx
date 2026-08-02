"use client";

import { useMemo, useState } from "react";
import type { ICard } from "@/types/card.types";
import {
  actionHref,
  downloadUrlAsFile,
  hasBankDetails,
  metaFor,
  resolveActionButtons,
  type ActionButtonKey,
} from "@/lib/action-buttons";
import { isActionAllowed } from "@/lib/feature-permissions";
import { absoluteUrl } from "@/lib/utils";
import { BankDetailsModal } from "./BankDetailsModal";
import { InquiryFormModal } from "./InquiryFormModal";
import type { IUserFeatures } from "@/types/platform.types";

function IconGlyph({ name }: { name: string }) {
  const map: Record<string, string> = {
    call: "☎",
    whatsapp: "💬",
    email: "✉",
    website: "🌐",
    bank: "🏦",
    address: "📍",
    videos: "▶",
    brochures: "📄",
    bookNow: "📅",
    form: "📝",
    facebook: "f",
    instagram: "IG",
    youtube: "▶",
    linkedin: "in",
    twitter: "𝕏",
    review: "★",
    qr: "▦",
    install: "＋",
  };
  return <span className="text-base leading-none">{map[name] || "•"}</span>;
}

export function ActionIconGrid({
  card,
  onTrack,
  features,
}: {
  card: ICard;
  buttonColor?: string;
  softColor?: string;
  onTrack?: (detail: string) => void;
  features?: IUserFeatures | null;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const publicUrl = absoluteUrl(`/c/${card.username}`);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}`;

  const visible = useMemo(() => {
    return resolveActionButtons(card).filter((b) => {
      if (!b.enabled) return false;
      if (features && !isActionAllowed(b.key, features)) return false;
      const meta = metaFor(b.key);
      if (meta.valueKind === "none") return true;
      if (b.key === "bank") return hasBankDetails(card.bankDetails);
      if (b.key === "form") {
        return Boolean(card.whatsappNumber?.trim() || card.phone?.trim());
      }
      const v = b.value.trim();
      return Boolean(v) && v !== "configured" && v !== "ready";
    });
  }, [card, features]);

  function runAction(key: ActionButtonKey, value: string) {
    onTrack?.(key === "qr" ? "qr_code" : key);

    if (key === "bank") {
      if (!hasBankDetails(card.bankDetails)) {
        window.alert("Bank details are not configured yet.");
        return;
      }
      setBankOpen(true);
      return;
    }
    if (key === "form") {
      setFormOpen(true);
      return;
    }
    if (key === "qr") {
      setQrOpen(true);
      return;
    }
    if (key === "install") {
      window.alert(
        "To install: open browser menu → Add to Home Screen / Install app.",
      );
      return;
    }
    if (key === "brochures") {
      const url = value.trim();
      if (!url) return;
      void downloadUrlAsFile(
        url,
        `${card.username || "brochure"}-brochure.pdf`,
      );
      return;
    }

    const href = actionHref(key, value);
    if (href) {
      window.open(href, href.startsWith("http") ? "_blank" : undefined);
    }
  }

  if (!visible.length) return null;

  return (
    <>
      <div className="grid grid-cols-4 gap-x-1 gap-y-4 sm:grid-cols-5">
        {visible.map((btn) => {
          const meta = metaFor(btn.key);

          const inner = (
            <>
              <span
                className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] shadow-sm ring-1 ring-black/[0.04] transition hover:scale-105 active:scale-95"
                style={{ backgroundColor: meta.softBg, color: meta.softFg }}
              >
                <IconGlyph name={btn.key} />
              </span>
              <span className="mt-1.5 max-w-[76px] text-center text-[10px] font-semibold leading-tight text-foreground">
                {meta.label}
              </span>
            </>
          );

          if (
            meta.valueKind === "none" ||
            meta.valueKind === "modal" ||
            btn.key === "brochures"
          ) {
            return (
              <button
                key={btn.key}
                type="button"
                className="flex flex-col items-center"
                onClick={() => runAction(btn.key, btn.value)}
              >
                {inner}
              </button>
            );
          }

          const href = actionHref(btn.key, btn.value);
          if (!href) return null;

          return (
            <a
              key={btn.key}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex flex-col items-center"
              onClick={() => onTrack?.(btn.key)}
            >
              {inner}
            </a>
          );
        })}
      </div>

      {qrOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold">Scan QR Code</h3>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              {publicUrl}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="QR code"
              className="mx-auto mt-4 h-52 w-52 rounded-xl border bg-white p-2"
            />
            <button
              type="button"
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: metaFor("qr").softFg }}
              onClick={() =>
                void downloadUrlAsFile(
                  qrSrc,
                  `${card.username || "card"}-qr.png`,
                )
              }
            >
              Download QR Code
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground"
              onClick={() => setQrOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {bankOpen ? (
        <BankDetailsModal
          card={card}
          accent={metaFor("bank").softFg}
          onClose={() => setBankOpen(false)}
        />
      ) : null}

      {formOpen ? (
        <InquiryFormModal
          card={card}
          accent={metaFor("form").softFg}
          onClose={() => setFormOpen(false)}
          onSubmit={() => onTrack?.("form_inquiry")}
        />
      ) : null}
    </>
  );
}
