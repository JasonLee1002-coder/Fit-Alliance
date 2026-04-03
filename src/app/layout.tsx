import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "瘦身減肥聯盟 | Fit Alliance",
  description: "一起變瘦，一起變強。AI 教練陪你減脂，群體力量讓你堅持。",
  icons: [
    { rel: "icon", url: "/favicon.png", sizes: "48x48", type: "image/png" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50/50">{children}</body>
    </html>
  );
}
