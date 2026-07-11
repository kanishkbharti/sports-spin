import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { AppNav } from "@/components/layout/AppNav";
import { DraftProvider } from "@/lib/draft-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["600", "700", "800"],
});

const SITE_URL = "https://trysquadr.com";
const SITE_DESCRIPTION =
  "Squadr is home to Sports Squad Forge, a spin-and-draft game for football fans. Spin a random club, nation, or World Cup 26 squad, draft one real player at a time with accurate EA FC 26 ratings, and forge your ultimate starting XI solo or head-to-head.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Squadr | Spin, Draft, Forge Your Ultimate XI",
    template: "%s | Squadr",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Squadr",
  keywords: [
    "football draft game",
    "spin and draft",
    "World Cup 26 draft",
    "build your XI",
    "fantasy football draft",
    "Sports Squad Forge",
    "trysquadr",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Squadr",
    title: "Squadr | Spin, Draft, Forge Your Ultimate XI",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Squadr | Spin, Draft, Forge Your Ultimate XI",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="min-h-screen bg-bg antialiased">
        <DraftProvider>
          <AppNav />
          <main className="pt-14">{children}</main>
        </DraftProvider>
      </body>
    </html>
  );
}
