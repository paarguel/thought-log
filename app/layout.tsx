import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { DataNotice } from "@/components/app/data-notice";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thinking Errors NotePad",
  description:
    "A private notepad for thinking errors. Write it out, circle the thoughts, name the patterns. Everything stays on your device.",
  applicationName: "Thinking Errors NotePad",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf6ef",
  // Draw edge-to-edge in the native shell; safe-area padding is in globals.css.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DataNotice />
      </body>
    </html>
  );
}
