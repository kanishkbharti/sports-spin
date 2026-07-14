import type { Metadata } from "next";
import { Inter, Archivo, Archivo_Black } from "next/font/google";
import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
import { DraftProvider } from "@/lib/draft-context";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
  weight: "400",
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
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} ${archivoBlack.variable}`}
    >
      <body className="min-h-[100dvh] bg-bg antialiased">
        <DraftProvider>
          <AppNav />
          <main className="relative pt-14">{children}</main>
          <Footer />
        </DraftProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
