import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Fireflies Clone",
  description: "Meeting intelligence workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-full bg-background text-body`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
