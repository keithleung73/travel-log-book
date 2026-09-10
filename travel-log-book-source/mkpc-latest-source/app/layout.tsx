import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sans = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const serif = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "環球探索日誌 2026–2027｜萬鈞伯裘書院",
  description:
    "萬鈞伯裘書院 Global Exploration Journal。學生於交流團期間網上填寫日誌、上載相片，並可下載印製成書。",
};

export const viewport: Viewport = {
  themeColor: "#102445",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="zh-Hant"
      className={`${sans.variable} ${serif.variable} ${display.variable} h-full antialiased`}
    >
      <body className="paper-bg min-h-full flex flex-col font-sans text-ink">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
