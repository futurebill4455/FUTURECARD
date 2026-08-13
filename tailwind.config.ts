import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(45, 212, 191, 0.25)",
        "glow-lg": "0 0 48px rgba(45, 212, 191, 0.3)",
        panel:
          "0 0 0 1px rgba(45, 212, 191, 0.08), 0 20px 50px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "soft-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "hero-float": {
          "0%, 100%": {
            transform: "translateY(0px) rotateX(0.4deg) rotateY(-1.4deg)",
          },
          "50%": {
            transform: "translateY(-7px) rotateX(1.2deg) rotateY(1.2deg)",
          },
        },
        "hero-bob": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "hero-swipe": {
          "0%": { transform: "rotate(10deg)" },
          "45%": { transform: "rotate(-16deg)" },
          "100%": { transform: "rotate(10deg)" },
        },
        "hero-breathe": {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.012)" },
        },
        "hero-swipe-once": {
          "0%": { transform: "rotate(-2deg)" },
          "38%": { transform: "rotate(-18deg)" },
          "100%": { transform: "rotate(-6deg)" },
        },
        "fs-hint-idle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        "fs-hint-swipe": {
          "0%": { transform: "translateY(4px)", opacity: "0.35" },
          "55%": { transform: "translateY(-8px)", opacity: "1" },
          "100%": { transform: "translateY(-2px)", opacity: "0.7" },
        },
        "fs-hint-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up-delay":
          "fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both",
        "fade-in": "fade-in 0.4s ease-out both",
        "soft-pulse": "soft-pulse 3.5s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        shimmer: "shimmer 2.8s linear infinite",
        "hero-float": "hero-float 5.8s ease-in-out infinite",
        "hero-bob": "hero-bob 3.6s ease-in-out infinite",
        "hero-swipe": "hero-swipe 1.15s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        "hero-breathe": "hero-breathe 4.8s ease-in-out infinite",
        "hero-swipe-once":
          "hero-swipe-once 1.45s cubic-bezier(0.45, 0.05, 0.2, 1) both",
        "fs-hint-idle": "fs-hint-idle 3.4s ease-in-out infinite",
        "fs-hint-swipe": "fs-hint-swipe 1.15s cubic-bezier(0.45, 0.05, 0.2, 1) both",
        "fs-hint-pulse": "fs-hint-pulse 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
