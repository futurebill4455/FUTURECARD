import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/providers/Providers";
import { getAppBaseUrl } from "@/lib/app-url";
import "./globals.css";

const display = localFont({
  src: "./fonts/space-grotesk.woff2",
  variable: "--font-display",
  weight: "500 700",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/outfit.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-mono",
  weight: "400 600",
  display: "swap",
});

export const metadata: Metadata = {
  // Required so Next can resolve relative icon URLs while prerendering /_not-found.
  metadataBase: getAppBaseUrl(),
  title: "FutureCard — Digital Visiting Cards",
  description:
    "Create, manage, and share professional digital visiting cards with analytics and subscriptions.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans selection:bg-teal-400/30`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
