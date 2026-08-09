"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { VerifiedByBrand } from "@/components/shared/VerifiedByBrand";

const links = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#stories", label: "Stories" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-teal-400/15 bg-slate-950/75 backdrop-blur-xl shadow-glow"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            href="/"
            className="font-display text-xl font-extrabold tracking-tight sm:text-2xl"
          >
            Future<span className="text-gradient">Card</span>
          </Link>
          <VerifiedByBrand size="sm" className="hidden sm:inline-flex" />
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-teal-100/60 transition hover:text-teal-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-teal-100/70 sm:inline hover:text-teal-200"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-glow transition hover:scale-105 hover:brightness-110"
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 bg-slate-950/50 px-4 py-1.5 backdrop-blur-md sm:hidden">
        <VerifiedByBrand size="sm" className="justify-center" />
      </div>
    </motion.header>
  );
}
