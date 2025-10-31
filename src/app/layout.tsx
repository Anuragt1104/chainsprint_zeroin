import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainSprint · Powered by Zerion API",
  description:
    "ChainSprint turns Zerion's multi-chain wallet intelligence into social sprints, real-time copy moves, and creator-ready crypto coordination.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "ChainSprint · Powered by Zerion API",
    description:
      "Motivate crews, derisk copy moves, and celebrate onchain wins using Zerion's portfolio, position, and webhook intelligence.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainSprint · Zerion Hackathon Sprint",
    description:
      "A social coordination layer for crypto crews powered by Zerion's multi-chain data stack.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
