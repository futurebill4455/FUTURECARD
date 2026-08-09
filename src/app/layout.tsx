import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import { Providers } from "@/providers/Providers";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FutureCard — Digital Visiting Cards",
  description:
    "Create, manage, and share professional digital visiting cards with analytics and subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${display.variable} ${sans.variable} font-sans selection:bg-teal-400/30`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
