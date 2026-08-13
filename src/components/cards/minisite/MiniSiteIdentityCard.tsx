"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { PLATFORM_BRAND } from "@/lib/service-categories";
import type { ICard } from "@/types/card.types";
import { cn } from "@/lib/utils";
import { useCardPublicUrl } from "@/hooks/useAbsoluteUrl";
import { VerifiedBadge } from "@/components/cards/VerifiedBadge";
import { PremiumMotionButton } from "@/components/cards/minisite/PremiumMotionButton";

export function MiniSiteIdentityCard({
  card,
  accent,
  onSave,
  onShare,
  onCall,
  onWhatsApp,
  onQr,
}: {
  card: ICard;
  accent: string;
  onSave: () => void;
  onShare: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
  onQr?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 180,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), {
    stiffness: 180,
    damping: 18,
  });
  const shineX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const shine = useMotionTemplate`radial-gradient(420px circle at ${shineX} ${shineY}, rgba(255,255,255,0.22), transparent 42%)`;

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    if (!point) return;
    mx.set((point.clientX - r.left) / r.width - 0.5);
    my.set((point.clientY - r.top) / r.height - 0.5);
  }

  function reset() {
    mx.set(0);
    my.set(0);
  }

  const publicUrl = useCardPublicUrl(card.username);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    publicUrl,
  )}`;

  return (
    <section id="profile" className="scroll-mt-24 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/55">
          Smart digital identity
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold text-slate-50 sm:text-3xl">
          Your card, elevated
        </h2>

        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={reset}
          onTouchMove={onMove}
          onTouchEnd={reset}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
          className="relative mt-8"
        >
          <div
            className="glow-border relative overflow-hidden rounded-[1.75rem] p-[1px] fx-pulse-glow"
            style={{
              boxShadow: `0 0 0 1px ${accent}33, 0 30px 80px rgba(0,0,0,0.55)`,
            }}
          >
            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#07141c] to-slate-950">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-screen"
                style={{ background: shine }}
              />
              <div className="pointer-events-none absolute inset-0 ambient-grid opacity-40" />

              <div className="relative p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/60">
                      {PLATFORM_BRAND}
                    </p>
                    <h3 className="mt-1 inline-flex max-w-full flex-wrap items-center gap-1 font-display text-xl font-bold text-slate-50">
                      <span className="truncate">{card.companyName}</span>
                      {card.isVerified ? (
                        <VerifiedBadge size="md" className="relative top-px" />
                      ) : null}
                    </h3>
                    <p className="mt-0.5 text-sm text-cyan-100/65">
                      {card.jobTitle || card.businessCategory || "Professional"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/90 p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrSrc} alt="QR" className="h-14 w-14 rounded-lg object-contain" />
                  </div>
                </div>

                <div className="mt-5 grid gap-2 font-mono text-[11px] text-slate-300/80 sm:grid-cols-2">
                  {card.phone ? <Field label="Phone" value={card.phone} /> : null}
                  {card.email ? <Field label="Email" value={card.email} /> : null}
                  {card.website ? (
                    <Field
                      label="Web"
                      value={card.website.replace(/^https?:\/\//, "")}
                    />
                  ) : null}
                  {card.location?.address ? (
                    <Field label="Location" value={card.location.address} />
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                    NFC Ready
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 [&>*]:min-h-11">
                  <CardAction label="Save" onClick={onSave} accent={accent} primary />
                  <CardAction label="Share" onClick={onShare} />
                  <CardAction label="QR" onClick={onQr} />
                  <CardAction label="Call" onClick={onCall} />
                  <CardAction label="WhatsApp" onClick={onWhatsApp} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 truncate text-slate-200">{value}</div>
    </div>
  );
}

function CardAction({
  label,
  onClick,
  accent,
  primary,
  className,
}: {
  label: string;
  onClick?: () => void;
  accent?: string;
  primary?: boolean;
  className?: string;
}) {
  return (
    <PremiumMotionButton
      onClick={onClick}
      disabled={!onClick}
      accent={accent}
      variant={primary ? "primary" : "ghost"}
      className={cn(
        "flex h-full min-h-11 w-full items-center justify-center rounded-xl px-2 py-2.5 text-[10px]",
        className,
      )}
    >
      {label}
    </PremiumMotionButton>
  );
}
