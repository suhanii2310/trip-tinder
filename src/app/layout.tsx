import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trip Tinder",
  description: "Swipe together, travel together.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBF8" },
    { media: "(prefers-color-scheme: dark)", color: "#17171B" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        {/* One phone-width column: full screen on a phone, centered on a laptop. */}
        <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bg">{children}</main>
      </body>
    </html>
  );
}
