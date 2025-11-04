import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const clashDisplay = localFont({
  variable: "--font-clash",
  src: [
    { path: "../fonts/ClashDisplay-Extralight.otf", weight: "200", style: "normal" },
    { path: "../fonts/ClashDisplay-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/ClashDisplay-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/ClashDisplay-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-Semibold.otf", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-Bold.otf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Just HODL It.",
  description: "Keep your assets. Minimize your portfolio.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${clashDisplay.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* mx-auto w-full max-w-[560px] min-h-dvh pt-[max(env(safe-area-inset-top),0px)] pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+64px)]" */}

        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
