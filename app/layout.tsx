import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/common/SEO";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { getConfig } from "@/lib/getConfig";
import { themeStyle } from "@/lib/themeLoader";
import { buildMetadata } from "@/lib/seoBuilder";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config);
}

export const revalidate = 3600;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-[var(--brand-background)] text-[var(--brand-text)]"
        style={themeStyle(config)}
      >
        <StructuredData config={config} />
        <MotionProvider>
          <Navbar app={config.app} />
          <main className="flex-1">{children}</main>
          <Footer app={config.app} />
        </MotionProvider>
      </body>
    </html>
  );
}
