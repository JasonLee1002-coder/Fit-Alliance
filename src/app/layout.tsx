import type { Metadata } from "next";
import "./globals.css";
import PwaInstallPrompt from "@/components/shared/pwa-install-prompt";
import PwaTopBanner from "@/components/shared/pwa-top-banner";
import SplashScreen from "@/components/shared/splash-screen";

export const metadata: Metadata = {
  title: "瘦身減肥聯盟 | Fit Alliance",
  description: "一起變瘦，一起變強。AI 教練陪你減脂，群體力量讓你堅持。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "瘦身減肥聯盟",
  },
  other: { "mobile-web-app-capable": "yes" },
  icons: [
    { rel: "icon", url: "/favicon.png", sizes: "48x48", type: "image/png" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-gray-50/50">
        <SplashScreen />
        <PwaTopBanner />
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
