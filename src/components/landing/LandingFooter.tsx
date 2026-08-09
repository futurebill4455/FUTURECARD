"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  DEFAULT_LANDING_CMS,
  type ILandingFooterContent,
} from "@/types/landing-cms.types";

export function LandingFooter({
  content = DEFAULT_LANDING_CMS.footer,
  adminWhatsapp,
  companyName,
}: {
  content?: ILandingFooterContent;
  adminWhatsapp?: string;
  companyName?: string;
}) {
  const phone = (adminWhatsapp || "").replace(/\D/g, "");
  const displayPhone = adminWhatsapp || "";

  return (
    <footer className="relative border-t border-teal-900/10 bg-[#0b1f1c] text-teal-50">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]"
        >
          <div>
            <Link href="/" className="font-display text-2xl font-extrabold">
              Future<span className="text-teal-400">Card</span>
            </Link>
            <p className="mt-2 text-sm font-semibold text-teal-300">
              {content.brandSubline}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-teal-100/65">
              {content.description}
            </p>
            {phone ? (
              <p className="mt-4 text-sm text-teal-200/70">
                WhatsApp:{" "}
                <a
                  href={`https://wa.me/${phone}`}
                  className="font-semibold text-teal-300 hover:text-white"
                >
                  {displayPhone}
                </a>
              </p>
            ) : null}
            {companyName ? (
              <p className="mt-2 text-xs text-teal-200/50">{companyName}</p>
            ) : null}
          </div>

          {content.columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-400/80">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.href}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="text-sm text-teal-100/70 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-teal-200/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} FutureCard. All rights reserved.
          </p>
          <p>{content.copyrightNote}</p>
        </div>
      </div>
    </footer>
  );
}
