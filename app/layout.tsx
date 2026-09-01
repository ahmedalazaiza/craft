import type { Metadata, Viewport } from "next";
import { bricolage, inter } from "@/lib/fonts";
import "./globals.css";
import { SessionProvider } from "@/lib/session-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { TopLoader } from "@/components/layout/top-loader";
import { PageLoadingOverlay } from "@/components/layout/page-loading-overlay";
import { NetworkStatusIndicator } from "@/components/layout/network-status-indicator";
import { CookieConsentBanner } from "@/components/ui/cookie-consent-banner";

import Script from "next/script";

import {
  SITE_NAME,
  SITE_URL,
  defaultTitle,
  defaultDescription,
  PRIMARY_KEYWORDS,
  generateWebSiteJsonLd,
  generateOrganizationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s · ${SITE_NAME}`,
  },
  description: defaultDescription,
  keywords: PRIMARY_KEYWORDS,
  authors: [{ name: "Layerat Curators", url: SITE_URL }],
  creator: "Layerat",
  publisher: "Layerat Platforms Inc.",
  applicationName: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-image.png"],
    creator: "@layerat",
    site: "@layerat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo-icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#090C09" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteJsonLd();
  const organizationSchema = generateOrganizationJsonLd();

  return (
    <html lang="en" className={bricolage.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect & DNS-Prefetch for Speed & LCP Core Web Vitals */}
        <link rel="preconnect" href="https://ttjobsgglwgyioqlldqj.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Global Schema.org JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Blocking theme script: locked to light theme for now, dynamic logic preserved */}
        <Script
          id="craft-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.setAttribute('data-theme', 'light');
                  /* PRESERVED FOR FUTURE RE-ACTIVATION:
                  var stored = localStorage.getItem('craft-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = (stored === 'light' || stored === 'dark') ? stored : (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  */
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-[var(--bg-screen)] text-[var(--content-primary)] antialiased`}
      >
        <ThemeProvider>
          <SessionProvider>
            <Suspense fallback={null}>
              <TopLoader />
              <PageLoadingOverlay />
            </Suspense>

            <SiteHeader />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <SiteFooter />
            <MobileBottomNav />
            <NetworkStatusIndicator />
            <CookieConsentBanner />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
