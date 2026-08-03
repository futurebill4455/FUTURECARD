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
          ? "border-b border-white/40 bg-[#f4faf8]/85 backdrop-blur-xl shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            href="/"
            className="font-display text-xl font-extrabold tracking-tight sm:text-2xl"
          >
            Future<span className="text-teal-700">Card</span>
          </Link>
          <VerifiedByBrand size="sm" className="hidden sm:inline-flex" />
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-zinc-600 transition hover:text-teal-800"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden lg:block">
            <VerifiedByBrand size="sm" />
          </div>
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-zinc-700 sm:inline hover:text-teal-800"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-teal-900"
          >
            Get Started
          </Link>
        </div>
      </div>
      {/* Mobile verified strip */}
      <div className="border-t border-teal-900/5 bg-white/40 px-4 py-1.5 backdrop-blur-md sm:hidden">
        <VerifiedByBrand size="sm" className="justify-center" />
      </div>
    </motion.header>
  );
}
