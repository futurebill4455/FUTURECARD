"use client";

import { motion } from "framer-motion";
import { useCardPublicUrl } from "@/hooks/useAbsoluteUrl";
import type { ICard } from "@/types/card.types";
import { PremiumMotionButton } from "@/components/cards/minisite/PremiumMotionButton";

export function MiniSiteQrTerminal({
  card,
  accent,
  onSave,
  onShare,
}: {
  card: ICard;
  accent: string;
  onSave: () => void;
  onShare: () => void;
}) {
  const url = useCardPublicUrl(card.username);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(url)}`;

  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-cyan-400/25 bg-gradient-to-b from-slate-950 via-[#041018] to-slate-950 p-6 shadow-glow-lg sm:p-8">
        <div className="pointer-events-none absolute inset-0 ambient-grid opacity-50" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full blur-3xl"
          style={{ backgroundColor: `${accent}33` }}
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <p className="relative text-center font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300/70">
          Digital identity terminal
        </p>
        <h2 className="relative mt-2 text-center font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
          Scan to connect
        </h2>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative mx-auto mt-7 flex w-fit max-w-full justify-center rounded-[1.35rem] bg-gradient-to-br from-cyan-400/40 via-violet-400/20 to-transparent p-[2px] fx-pulse-glow"
        >
          <div className="rounded-[1.25rem] bg-white p-3 max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`QR code for ${card.companyName || "profile"}`}
              width={208}
              height={208}
              className="mx-auto h-auto w-[min(11rem,100%)] max-w-full aspect-square object-contain sm:w-52"
              loading="lazy"
            />
          </div>
        </motion.div>

        <p className="relative mt-4 break-all text-center font-mono text-[10px] text-slate-500">
          {url}
        </p>

        <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.15)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
            NFC Enabled
          </span>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2">
          <PremiumMotionButton accent={accent} onClick={onSave} className="w-full">
            Save Contact
          </PremiumMotionButton>
          <PremiumMotionButton
            variant="outline"
            onClick={onShare}
            className="w-full"
          >
            Share Profile
          </PremiumMotionButton>
        </div>
      </div>
    </section>
  );
}
