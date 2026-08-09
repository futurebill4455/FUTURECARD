"use client";

import { cn } from "@/lib/utils";

/** Semi-transparent neon SVG icons with glass/glow edges */
export function NeonActionIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<string, React.ReactNode> = {
    call: (
      <>
        <path {...common} d="M8 3.5c1 .4 1.8 1.4 2 2.5.1.6-.1 1.2-.5 1.6L8.2 9c1.4 2.5 3.5 4.5 6 5.8l1.3-1.2c.5-.4 1.1-.6 1.7-.5 1.1.2 2.1 1 2.5 2v.2c0 1.4-1.2 2.6-2.6 2.4C10.2 17 5 11.8 3.6 4.9 3.4 3.5 4.6 2.3 6 2.3h.2c.8 0 1.4.5 1.8 1.2z" />
      </>
    ),
    whatsapp: (
      <>
        <path {...common} d="M12 3.5a8 8 0 0 0-6.9 12l-.9 3.2 3.3-.9A8 8 0 1 0 12 3.5z" />
        <path {...common} d="M9.2 10.2c.8 1.8 2.1 3 3.8 3.6l1-.8c.2-.2.5-.2.7-.1l1.2.5c.3.1.4.4.3.7-.5 1.3-1.9 2-3.3 1.7-3.2-.6-5.7-3.2-6.2-6.4-.2-1.4.6-2.7 1.9-3.1.3-.1.6 0 .7.3l.5 1.2c.1.2 0 .5-.1.7l-.8 1z" />
      </>
    ),
    email: (
      <>
        <rect {...common} x="3.5" y="5.5" width="17" height="13" rx="2.2" />
        <path {...common} d="m4.5 7.5 7.5 5.5 7.5-5.5" />
      </>
    ),
    website: (
      <>
        <circle {...common} cx="12" cy="12" r="8" />
        <path {...common} d="M4 12h16M12 4c2.2 2.4 3.3 5 3.3 8s-1.1 5.6-3.3 8c-2.2-2.4-3.3-5-3.3-8S9.8 6.4 12 4z" />
      </>
    ),
    bank: (
      <>
        <path {...common} d="M4 10h16M5 10v7M19 10v7M3.5 17.5h17M12 4.5 4.5 9h15z" />
      </>
    ),
    address: (
      <>
        <path {...common} d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 12 4.3a6.5 6.5 0 0 0-6.5 6.5C5.5 15.8 12 21 12 21z" />
        <circle {...common} cx="12" cy="10.8" r="2.2" />
      </>
    ),
    videos: (
      <>
        <rect {...common} x="3.5" y="6" width="12" height="12" rx="2" />
        <path {...common} d="m15.5 10 5-2.5v9L15.5 14" />
      </>
    ),
    brochures: (
      <>
        <path {...common} d="M7 4.5h8.5A2.5 2.5 0 0 1 18 7v12.5l-4-2-4 2V7A2.5 2.5 0 0 0 7.5 4.5H7" />
        <path {...common} d="M9 9h5M9 12h5" />
      </>
    ),
    bookNow: (
      <>
        <rect {...common} x="4" y="5" width="16" height="15" rx="2" />
        <path {...common} d="M8 3.5v3M16 3.5v3M4 9.5h16" />
      </>
    ),
    form: (
      <>
        <path {...common} d="M7 4.5h7l3.5 3.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5z" />
        <path {...common} d="M14 4.5V9h4M8.5 12h7M8.5 15.5h5" />
      </>
    ),
    facebook: <path {...common} d="M14 8h2V5h-2c-2.2 0-3.5 1.4-3.5 3.5V11H8v3h2.5v6H14v-6h2.2l.5-3H14V8.8c0-.5.2-.8.7-.8z" />,
    instagram: (
      <>
        <rect {...common} x="4.5" y="4.5" width="15" height="15" rx="4" />
        <circle {...common} cx="12" cy="12" r="3.5" />
        <circle {...common} cx="16.6" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
    youtube: (
      <>
        <path {...common} d="M21 9.2a3 3 0 0 0-2.1-2.1C17.2 6.5 12 6.5 12 6.5s-5.2 0-6.9.6A3 3 0 0 0 3 9.2 31 31 0 0 0 3 14.8a3 3 0 0 0 2.1 2.1c1.7.6 6.9.6 6.9.6s5.2 0 6.9-.6a3 3 0 0 0 2.1-2.1 31 31 0 0 0 0-5.6z" />
        <path {...common} d="m10.5 15 4.2-2.5-4.2-2.5z" fill="currentColor" stroke="none" />
      </>
    ),
    linkedin: (
      <>
        <path {...common} d="M6.5 9.5V18M6.5 6.8v.2" />
        <path {...common} d="M10.5 18v-5.2c0-2.2 1.2-3.3 2.9-3.3 1.7 0 2.6 1.2 2.6 3.3V18" />
      </>
    ),
    twitter: <path {...common} d="M5 5.5 11.2 13 5.4 18.5h2l4.7-4.5 3.8 4.5H19L12.6 11l5.4-5.5h-2l-4.4 4.2L8 5.5z" />,
    review: (
      <>
        <path {...common} d="m12 3.5 2.2 4.6 5 .7-3.6 3.5.9 5.1L12 15l-4.5 2.4.9-5.1L4.8 8.8l5-.7z" />
      </>
    ),
    qr: (
      <>
        <path {...common} d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h2v2h-2zM18 14h1v1h-1zM16 16h1v1h-1zM18 18h1v1h-1zM14 18h2v1h-2z" />
      </>
    ),
    install: (
      <>
        <path {...common} d="M12 4v10M8.5 10.5 12 14l3.5-3.5M6 18h12" />
      </>
    ),
  };

  return (
    <span
      className={cn(
        "relative inline-flex h-6 w-6 items-center justify-center text-current drop-shadow-[0_0_8px_currentColor]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
        {paths[name] || <circle {...common} cx="12" cy="12" r="6" />}
      </svg>
    </span>
  );
}
