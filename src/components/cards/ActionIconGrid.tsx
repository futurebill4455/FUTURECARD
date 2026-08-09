"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { NeonActionIcon } from "./NeonActionIcon";
import type { IUserFeatures } from "@/types/platform.types";

function IconGlyph({ name }: { name: string }) {
  return (
    <NeonActionIcon
      name={name}
      className="h-[1.35rem] w-[1.35rem] drop-shadow-[0_0_10px_currentColor] drop-shadow-[0_0_18px_currentColor]"
    />
  );
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
      <div className="ms-holo-grid grid grid-cols-4 gap-x-1 gap-y-4 sm:grid-cols-5">
        {visible.map((btn, i) => {
          const meta = metaFor(btn.key);
          const neon = meta.softFg;

          const inner = (
            <>
              <motion.span
                whileHover={{
                  scale: 1.1,
                  y: -8,
                  rotateX: 8,
                  rotateY: -6,
                  z: 40,
                }}
                whileTap={{ scale: 0.96, y: -2 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                title={meta.label}
                className="ms-holo-icon"
                style={
                  {
                    ["--ms-holo-neon" as string]: neon,
                    color: neon,
                  } as CSSProperties
                }
              >
                <span className="relative z-[1]">
                  <IconGlyph name={btn.key} />
                </span>
              </motion.span>
              <span
                className="ms-holo-label"
                style={{ ["--ms-holo-neon" as string]: neon }}
              >
                {meta.label}
              </span>
            </>
          );

          const itemClass =
            "group/holo flex flex-col items-center outline-none";

          if (
            meta.valueKind === "none" ||
            meta.valueKind === "modal" ||
            btn.key === "brochures"
          ) {
            return (
              <motion.button
                key={btn.key}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                className={itemClass}
                onClick={() => runAction(btn.key, btn.value)}
              >
                {inner}
              </motion.button>
            );
          }

          const href = actionHref(btn.key, btn.value);
          if (!href) return null;

          return (
            <motion.a
              key={btn.key}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className={itemClass}
              onClick={() => onTrack?.(btn.key)}
            >
              {inner}
            </motion.a>
          );
        })}
      </div>

      <AnimatePresence>
        {qrOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-teal-400/25 bg-slate-950/90 p-6 text-center shadow-glow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-teal-400/20 blur-3xl" />
              <h3 className="relative font-display text-lg font-bold text-teal-50">
                Scan to connect
              </h3>
              <p className="relative mt-1 break-all text-xs text-teal-100/50">
                {publicUrl}
              </p>
              <div className="relative mx-auto mt-5 w-fit rounded-2xl bg-gradient-to-br from-teal-400/40 via-cyan-400/20 to-transparent p-[2px] fx-pulse-glow">
                <div className="rounded-[0.9rem] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSrc}
                    alt="QR code"
                    className="h-48 w-48 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="button"
                className="relative mt-5 w-full rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 py-2.5 text-sm font-bold text-slate-950 shadow-glow"
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
                className="relative mt-2 w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-teal-100/70 transition hover:bg-white/5"
                onClick={() => setQrOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
