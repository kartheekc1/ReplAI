import type { Metadata, Viewport } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/shared/providers";
import { Toaster } from "sonner";
import "./globals.css";

const SITE_URL = "https://getreplai.in";
const SITE_NAME = "ReplAI";
const TAGLINE = "Turn Instagram comments into customers — automatically.";
const LONG_DESCRIPTION =
  "ReplAI automatically sends DMs when followers comment keywords like 'link', 'price', or 'details' on your Instagram posts and reels. Capture leads, track conversions, and grow your business on autopilot.";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

/**
 * Site-wide SEO metadata.
 * Every child page inherits from this and can override (title, description, etc).
 * Per-page overrides happen via `export const metadata` in the page file.
 *
 * Title template: every page title becomes "<Page> | ReplAI"
 *   except the root, which uses the literal `default` value.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: LONG_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "ReplAI", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "instagram automation",
    "instagram dm automation",
    "comment to dm",
    "instagram lead generation",
    "instagram chatbot",
    "manychat alternative",
    "linkplease alternative",
    "creator tools",
    "instagram crm",
    "instagram analytics",
  ],
  referrer: "origin-when-cross-origin",
  creator: "ReplAI",
  publisher: "ReplAI",

  // Canonical + alternates — picks one URL per page when duplicates exist
  alternates: {
    canonical: "/",
  },

  // Crawler directives — explicit "index, follow" so Google doesn't second-guess
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph — Facebook, LinkedIn, Slack, Discord, Telegram, WhatsApp
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: LONG_DESCRIPTION,
    images: [
      {
        url: "/og.png", // drop a 1200×630 PNG at frontend/public/og.png
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Instagram comment to DM automation`,
      },
    ],
  },

  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    site: "@getreplai",       // change to your handle
    creator: "@getreplai",
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: LONG_DESCRIPTION,
    images: ["/og.png"],
  },

  // Favicon + Apple touch icon — derived from /public/logo.svg
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "any" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.svg",
  },

  // Search-console verification — paste your token once Google gives it
  // verification: {
  //   google: "abcdefghijklmnop1234567890",
  //   yandex: "xxxxxxxxxxxxxxxx",
  //   other: { "msvalidate.01": "BING_VERIFICATION_TOKEN" },
  // },

  category: "technology",
};

/**
 * Mobile + theme-color meta. Next.js 15 separates viewport from metadata.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0b0b14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${jetbrains.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
