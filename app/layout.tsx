import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "wStrip - Free Online Photobooth",
  description:
    "Snap. Strip. Share. Free retro photostrips right in your browser. Pick a template, strike a pose with friends, and share to Instagram and Facebook.",
  keywords: [
    "photobooth",
    "photostrip",
    "online photobooth",
    "free photobooth",
    "instagram photostrip",
    "retro photostrip",
  ],
  openGraph: {
    title: "wStrip - Free Online Photobooth",
    description: "Snap. Strip. Share. Free photostrips for friends. No login, no install.",
    siteName: "wStrip",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wStrip - Free Online Photobooth",
    description: "Snap. Strip. Share. Free photostrips for friends.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eef0f7",
  colorScheme: "only light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-[100dvh] flex-col selection:bg-[#007aff]/25">
        <Suspense fallback={<div className="mac-menubar h-9" />}>
          <Navbar />
        </Suspense>
        <main className="w-full flex-1">{children}</main>
      </body>
    </html>
  );
}
